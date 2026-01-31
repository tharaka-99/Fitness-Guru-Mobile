import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesPackage, CustomerInfo, PAYWALL_RESULT } from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

// --- Types ---
interface UserState {
  isProMember: boolean;
  managementURL: string;
}

interface EnhancedPackage extends PurchasesPackage {
  metadata?: Record<string, any>;
  formattedTitle: string;
  features: string[];
}

interface RevenueCatContextType {
  user: UserState;
  packages: EnhancedPackage[];
  presentPaywallUIAndHandleResult: () => Promise<boolean>;
  isReady: boolean;
  currentPlanIdentifier: string | null;
  refreshSubscriptionStatus: () => Promise<void>;
  nextBillingDate: string | null;
  showCelebration: boolean;
  triggerCelebration: () => void;
}

// Default context values
const defaultContext: RevenueCatContextType = {
  user: {
    isProMember: false,
    managementURL: '',
  },
  packages: [],
  presentPaywallUIAndHandleResult: async () => false,
  isReady: false,
  currentPlanIdentifier: null,
  refreshSubscriptionStatus: async () => {},
  nextBillingDate: null,
  showCelebration: false,
  triggerCelebration: () => {},
};

const PRO_ENTITLEMENT_ID = 'pro'; // Adjust this to your RevenueCat Entitlement ID

// Create the context
const RevenueCatContext = createContext<RevenueCatContextType>(defaultContext);

export const useRevenueCat = () => useContext(RevenueCatContext);

// --- Provider Component ---
export const RevenueCatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userState, setUserState] = useState<UserState>(defaultContext.user);
  const [packages, setPackages] = useState<EnhancedPackage[]>(defaultContext.packages);
  const [isReady, setIsReady] = useState<boolean>(defaultContext.isReady);
  const [currentPlanIdentifier, setCurrentPlanIdentifier] = useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // --- Helper Functions ---
  const safeFormatDate = (dateMillis: number | null | undefined): string | null => {
    if (!dateMillis) return null;
    try {
      const date = new Date(dateMillis);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  const generateTitleFromPackage = (pkg: PurchasesPackage): string => {
    const type = pkg.packageType;
    if (type === 'ANNUAL') return 'Annual Plan';
    if (type === 'MONTHLY') return 'Monthly Plan';
    return pkg.product.title || 'Subscription Plan';
  };

  const showToast = (title: string, success: boolean = true) => {
    Alert.alert(success ? 'Success' : 'Error', title, [{ text: 'OK' }]);
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 5000);
  };

  // Process CustomerInfo updates
  const processCustomerInfo = useCallback((customerInfo: CustomerInfo | null) => {
    if (!customerInfo) return;

    const isPro = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;

    setUserState({
      isProMember: isPro,
      managementURL: customerInfo.managementURL || '',
    });

    const proEntitlementInfo = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
    setCurrentPlanIdentifier(proEntitlementInfo?.productIdentifier || null);
    setNextBillingDate(safeFormatDate(proEntitlementInfo?.expirationDateMillis));
  }, []);

  // Load offerings
  const loadOfferings = useCallback(async () => {
    try {
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      if (!currentOffering) {
        setPackages([]);
        return;
      }

      const metadata = (currentOffering.metadata || {}) as Record<string, any>;
      const enhancedPackages = currentOffering.availablePackages.map((pkg): EnhancedPackage => {
        const packageType = pkg.packageType?.toLowerCase() || 'unknown';
        const packageMetadata = metadata[packageType] || {};
        
        return {
          ...pkg,
          metadata: packageMetadata,
          formattedTitle: packageMetadata.title || generateTitleFromPackage(pkg),
          features: packageMetadata.features || [],
        };
      });

      setPackages(enhancedPackages);
    } catch (error) {
      console.error('Error loading offerings:', error);
      setPackages([]);
    }
  }, []);

  // Initialize RevenueCat SDK
  const initRevenueCat = useCallback(async () => {
    try {
      setIsReady(false);
      console.log('Initializing RevenueCat for Recipe App');

      // Demo/Dev User ID logic
      const userId = 'recipe_app_user_' + Math.random().toString(36).substr(2, 9);

      const apiKey = Platform.select({
        ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
        android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
      });

      if (!apiKey) {
        console.error('RevenueCat API key missing for platform:', Platform.OS);
        setIsReady(true);
        return;
      }

      Purchases.configure({ apiKey, appUserID: userId });

      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Setup listener
      const listener = (customerInfo: CustomerInfo) => processCustomerInfo(customerInfo);
      Purchases.addCustomerInfoUpdateListener(listener);

      // Initial data load
      await Promise.all([
        loadOfferings(),
        Purchases.getCustomerInfo().then(processCustomerInfo),
      ]);

      console.log('RevenueCat Initialized Successfully');
      setIsReady(true);

      return () => {
          Purchases.removeCustomerInfoUpdateListener(listener);
      };
    } catch (error) {
      console.error('RevenueCat initialization failed:', error);
      showToast('Subscription status unavailable', false);
      setIsReady(true);
    }
  }, [processCustomerInfo, loadOfferings]);

  // Effect to initialize and cleanup
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    initRevenueCat().then(unsub => {
        if (typeof unsub === 'function') cleanup = unsub;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [initRevenueCat]);

  // Present the paywall using RevenueCatUI
  const presentPaywallUIAndHandleResult = useCallback(async (): Promise<boolean> => {
    if (!isReady) {
      showToast('Service Unavailable', false);
      return false;
    }

    let purchaseSuccess = false;

    try {
      console.log('Presenting Paywall UI...');
      const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: PRO_ENTITLEMENT_ID,
      });

      console.log('Paywall UI Dismissed with result:', paywallResult);

      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED: {
          console.log('Paywall UI resulted in Purchase or Restore.');
          const latestCustomerInfo = await Purchases.getCustomerInfo();
          processCustomerInfo(latestCustomerInfo);

          if (latestCustomerInfo.entitlements.active[PRO_ENTITLEMENT_ID]) {
            showToast(
              paywallResult === PAYWALL_RESULT.PURCHASED ? 'Premium Activated!' : 'Subscription Restored!',
              true
            );
            triggerCelebration();
            purchaseSuccess = true;
          } else {
            console.warn('Paywall reported success/restore, but entitlement not found.');
            showToast('Subscription Updated', true);
          }
          break;
        }
        case PAYWALL_RESULT.CANCELLED:
          console.log('Paywall UI Cancelled by User.');
          break;
        case PAYWALL_RESULT.ERROR:
          console.error('Paywall UI Error.');
          showToast('Something Went Wrong', false);
          break;
        case PAYWALL_RESULT.NOT_PRESENTED:
          console.log('Paywall UI Not Presented (user already has access).');
          showToast('Premium Access Confirmed', true);
          triggerCelebration();
          purchaseSuccess = true;
          break;
      }
    } catch (e) {
      console.error('Error during presentPaywallUI:', e);
      showToast('An Unexpected Error Occurred', false);
    }

    return purchaseSuccess;
  }, [isReady, processCustomerInfo]);

  // Refresh subscription status manually
  const refreshSubscriptionStatus = useCallback(async () => {
    if (!isReady) return;
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      processCustomerInfo(customerInfo);
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
      showToast('Could not refresh status', false);
    }
  }, [isReady, processCustomerInfo]);

  return (
    <RevenueCatContext.Provider
      value={{
        user: userState,
        packages,
        presentPaywallUIAndHandleResult,
        isReady,
        currentPlanIdentifier,
        refreshSubscriptionStatus,
        nextBillingDate,
        showCelebration,
        triggerCelebration,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
};