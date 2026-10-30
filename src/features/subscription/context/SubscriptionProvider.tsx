import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Linking, Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
  PurchasesStoreProduct,
  PurchasesStoreProductDiscount,
  PurchasesPromotionalOffer,
  SubscriptionOption,
  LOG_LEVEL,
  INTRO_ELIGIBILITY_STATUS,
} from "react-native-purchases";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import env from "@utils/env";
import { authActions } from "@features/auth/context/slice";

export const SUBSCRIPTION_IDS = {
  REVENUE_CAT_MONTHLY_PACKAGE: "$rc_monthly",
  PREMIUM_ENTITLEMENT: "Premium access",
  IOS_TRIAL_PRODUCT: "premium_monthly_ios",
  PREMIUM_PLAN_NAME: "Premium",
  PARTNER_PROMOTION_PRODUCT: "fg_partner_promotion",
  PARTNER_PROMOTION_OFFER_ANDROID: "partner-offer",
} as const;

export interface TrialEligibility {
  status: INTRO_ELIGIBILITY_STATUS;
  isLoading: boolean;
}

export interface MonthlyPackageOffer {
  price: string | null;
  hasTrial: boolean;
}

interface SubscriptionContextType {
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  isSubscribed: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  trialEligibility: TrialEligibility;
  purchasePackage: (pack: PurchasesPackage) => Promise<void>;
  purchasePartnerPromotion: () => Promise<CustomerInfo>;
  restorePurchases: () => Promise<CustomerInfo | null>;
  refreshCustomerInfo: () => Promise<CustomerInfo | null>;
  presentCodeRedemption: (promoCode?: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const findRevenueCatPackage = (
  offerings: PurchasesOfferings | null | undefined,
  planId: string = SUBSCRIPTION_IDS.PREMIUM_PLAN_NAME
): PurchasesPackage | undefined => {
  const identifier =
    planId === SUBSCRIPTION_IDS.PREMIUM_PLAN_NAME
      ? SUBSCRIPTION_IDS.REVENUE_CAT_MONTHLY_PACKAGE
      : "";
  return offerings?.current?.availablePackages.find(
    (pkg) => pkg.identifier === identifier
  );
};

export const isSubscriptionActive = (info: CustomerInfo): boolean =>
  info.entitlements.active[SUBSCRIPTION_IDS.PREMIUM_ENTITLEMENT] !==
  undefined || info.activeSubscriptions.length > 0;

export const resolveMonthlyPackageOffer = (
  monthlyPackage: PurchasesPackage | undefined,
  trialEligibility: TrialEligibility
): MonthlyPackageOffer => {
  if (!monthlyPackage) {
    return { price: null, hasTrial: false };
  }

  const price = monthlyPackage.product.priceString ?? null;
  const introPrice = monthlyPackage.product.introPrice;
  const introTrial = introPrice && introPrice.price === 0 ? introPrice : null;

  const isEligible =
    trialEligibility.status ===
    INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE ||
    trialEligibility.status ===
    INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN;

  const hasAndroidTrial =
    Platform.OS === "android" &&
    (!!monthlyPackage.product.defaultOption?.freePhase ||
      introPrice?.price === 0);

  const hasiOSTrial = Platform.OS === "ios" && isEligible && !!introTrial;

  return {
    price,
    hasTrial: hasAndroidTrial || hasiOSTrial,
  };
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state["feature/auth"].user);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [trialEligibility, setTrialEligibility] = useState<TrialEligibility>({
    status: INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN,
    isLoading: true,
  });

  const updateSubscriptionStatus = useCallback(
    (info: CustomerInfo) => {
      const active = isSubscriptionActive(info);
      setIsSubscribed(active);
      dispatch(authActions.setSubscription({ status: active }));
    },
    [dispatch]
  );

  const refreshTrialEligibility = useCallback(async () => {
    try {
      setTrialEligibility((prev) => ({ ...prev, isLoading: true }));

      const result = await Purchases.checkTrialOrIntroductoryPriceEligibility([
        SUBSCRIPTION_IDS.IOS_TRIAL_PRODUCT,
      ]);

      const status =
        result[SUBSCRIPTION_IDS.IOS_TRIAL_PRODUCT]?.status ??
        INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN;

      setTrialEligibility({ status, isLoading: false });
    } catch (error) {
      console.error("Error checking trial eligibility:", error);
      setTrialEligibility({
        status: INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializePurchases = async () => {
      try {
        Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);

        const apiKey =
          Platform.OS === "ios"
            ? env.EXPO_PUBLIC_RC_IOS
            : env.EXPO_PUBLIC_RC_ANDROID;

        if (!apiKey) return;

        Purchases.configure({
          apiKey,
          appUserID: user?._id || undefined,
        });

        const [info, offers] = await Promise.all([
          Purchases.getCustomerInfo(),
          Purchases.getOfferings(),
        ]);

        if (!isMounted) return;

        setCustomerInfo(info);
        updateSubscriptionStatus(info);
        setOfferings(offers);

        if (Platform.OS === "ios") {
          await refreshTrialEligibility();
        } else {
          setTrialEligibility({
            status: INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error initializing RevenueCat:", error);
        if (isMounted) {
          setTrialEligibility((prev) => ({ ...prev, isLoading: false }));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializePurchases();

    return () => {
      isMounted = false;
    };
  }, [user?._id, updateSubscriptionStatus, refreshTrialEligibility]);

  useEffect(() => {
    const customerInfoUpdateListener = (info: CustomerInfo) => {
      setCustomerInfo(info);
      updateSubscriptionStatus(info);
      if (Platform.OS === "ios") {
        refreshTrialEligibility();
      }
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

    return () => {
      void Purchases.removeCustomerInfoUpdateListener(
        customerInfoUpdateListener
      );
    };
  }, [updateSubscriptionStatus, refreshTrialEligibility]);

  const purchasePackage = useCallback(
    async (pack: PurchasesPackage) => {
      setIsPurchasing(true);
      try {
        const result = await Purchases.purchasePackage(pack);
        setCustomerInfo(result.customerInfo);
        updateSubscriptionStatus(result.customerInfo);
      } catch (error: unknown) {
        const purchaseError = error as { userCancelled?: boolean };
        if (!purchaseError?.userCancelled) {
          console.error("Error purchasing package:", error);
          //throw error;
        }
        throw error;
      } finally {
        setIsPurchasing(false);
      }
    },
    [updateSubscriptionStatus]
  );

  const purchasePartnerPromotion = useCallback(async (): Promise<CustomerInfo> => {
    setIsPurchasing(true);
    try {
      if (Platform.OS === "android") {
        // Fetch products for partner promotion
        const products = await Purchases.getProducts(
          [SUBSCRIPTION_IDS.PARTNER_PROMOTION_PRODUCT],
          Purchases.PRODUCT_CATEGORY.SUBSCRIPTION
        );

        console.log(
          "[RevenueCat] Fetched partner promotion products:",
          products.map((p) => ({
            identifier: p.identifier,
            options: p.subscriptionOptions?.map((o) => ({ id: o.id, tags: o.tags })),
          }))
        );

        // In Google Play Billing, identifier is formatted as `productId:basePlanId` (e.g. fg_partner_promotion:partner-promo)
        const promoProduct =
          products.find(
            (p) =>
              p.identifier === SUBSCRIPTION_IDS.PARTNER_PROMOTION_PRODUCT ||
              p.identifier.startsWith(`${SUBSCRIPTION_IDS.PARTNER_PROMOTION_PRODUCT}:`) ||
              p.identifier.includes(SUBSCRIPTION_IDS.PARTNER_PROMOTION_PRODUCT)
          ) || products[0];

        if (!promoProduct) {
          throw new Error(
            `Product "${SUBSCRIPTION_IDS.PARTNER_PROMOTION_PRODUCT}" not found in Google Play.`
          );
        }

        // Search for the specific partner-offer option among subscription options
        const partnerOption =
          promoProduct.subscriptionOptions?.find(
            (opt: SubscriptionOption) =>
              opt.id === SUBSCRIPTION_IDS.PARTNER_PROMOTION_OFFER_ANDROID ||
              opt.id.endsWith(`:${SUBSCRIPTION_IDS.PARTNER_PROMOTION_OFFER_ANDROID}`) ||
              opt.id.includes(SUBSCRIPTION_IDS.PARTNER_PROMOTION_OFFER_ANDROID) ||
              opt.tags?.includes(SUBSCRIPTION_IDS.PARTNER_PROMOTION_OFFER_ANDROID)
          ) || promoProduct.defaultOption;

        if (!partnerOption) {
          throw new Error(
            `Subscription offer "${SUBSCRIPTION_IDS.PARTNER_PROMOTION_OFFER_ANDROID}" not found.`
          );
        }

        const result = await Purchases.purchaseSubscriptionOption(partnerOption);
        setCustomerInfo(result.customerInfo);
        updateSubscriptionStatus(result.customerInfo);
        return result.customerInfo;
      } else {
        // iOS Implementation
        const products = await Purchases.getProducts(
          [SUBSCRIPTION_IDS.PARTNER_PROMOTION_PRODUCT],
          Purchases.PRODUCT_CATEGORY.SUBSCRIPTION
        );

        const promoProduct =
          products.find(
            (p) =>
              p.identifier === SUBSCRIPTION_IDS.PARTNER_PROMOTION_PRODUCT ||
              p.identifier.startsWith(`${SUBSCRIPTION_IDS.PARTNER_PROMOTION_PRODUCT}:`) ||
              p.identifier.includes(SUBSCRIPTION_IDS.PARTNER_PROMOTION_PRODUCT)
          ) || products[0];

        if (!promoProduct) {
          throw new Error(
            `Product "${SUBSCRIPTION_IDS.PARTNER_PROMOTION_PRODUCT}" not found in App Store.`
          );
        }

        // Full iOS redemption structure/types alongside Android:
        // TODO: Insert iOS App Store Offer Key / ID here
        /*
        const discountIdentifier = "TODO_IOS_APP_STORE_OFFER_ID"; // TODO: Insert iOS App Store Offer Key / ID here
        const discount: PurchasesStoreProductDiscount | undefined =
          promoProduct.discounts?.find(
            (d) => d.identifier === discountIdentifier
          );

        if (!discount) {
          throw new Error(
            `iOS promotional discount offer "${discountIdentifier}" not found.`
          );
        }

        const promotionalOffer: PurchasesPromotionalOffer | undefined =
          await Purchases.getPromotionalOffer(promoProduct, discount);

        if (!promotionalOffer) {
          throw new Error("Failed to generate promotional offer for iOS.");
        }

        const result = await Purchases.purchaseDiscountedProduct(
          promoProduct,
          promotionalOffer
        );
        setCustomerInfo(result.customerInfo);
        updateSubscriptionStatus(result.customerInfo);
        return result.customerInfo;
        */

        // Fallback store product purchase until iOS App Store Offer Key / ID is configured
        const result = await Purchases.purchaseStoreProduct(promoProduct);
        setCustomerInfo(result.customerInfo);
        updateSubscriptionStatus(result.customerInfo);
        return result.customerInfo;
      }
    } catch (error: unknown) {
      const purchaseError = error as { userCancelled?: boolean };
      if (!purchaseError?.userCancelled) {
        console.error("Error purchasing partner promotion:", error);
      }
      throw error;
    } finally {
      setIsPurchasing(false);
    }
  }, [updateSubscriptionStatus]);

  const restorePurchases = useCallback(async () => {
    setIsRestoring(true);
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      updateSubscriptionStatus(info);
      if (Platform.OS === "ios") {
        await refreshTrialEligibility();
      }
      return info;
    } catch (error) {
      console.error("Error restoring purchases:", error);
      throw error;
    } finally {
      setIsRestoring(false);
    }
  }, [updateSubscriptionStatus, refreshTrialEligibility]);

  const refreshCustomerInfo = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      updateSubscriptionStatus(info);
      return info;
    } catch (error) {
      console.error("Error refreshing customer info:", error);
      throw error;
    }
  }, [updateSubscriptionStatus]);

  const presentCodeRedemption = useCallback(async (promoCode?: string) => {
    try {
      if (Platform.OS === "ios") {
        await Purchases.presentCodeRedemptionSheet();
      } else if (Platform.OS === "android") {
        const cleanCode = promoCode?.trim();
        const url = cleanCode
          ? `https://play.google.com/redeem?code=${encodeURIComponent(cleanCode)}`
          : "https://play.google.com/redeem";
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error presenting code redemption:", error);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      customerInfo,
      offerings,
      isSubscribed,
      isLoading,
      isPurchasing,
      isRestoring,
      trialEligibility,
      purchasePackage,
      purchasePartnerPromotion,
      restorePurchases,
      refreshCustomerInfo,
      presentCodeRedemption,
    }),
    [
      customerInfo,
      offerings,
      isSubscribed,
      isLoading,
      isPurchasing,
      isRestoring,
      trialEligibility,
      purchasePackage,
      purchasePartnerPromotion,
      restorePurchases,
      refreshCustomerInfo,
      presentCodeRedemption,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};
