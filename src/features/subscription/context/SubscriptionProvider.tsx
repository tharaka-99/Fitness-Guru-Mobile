import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
    CustomerInfo,
    PurchasesOfferings,
    PurchasesPackage,
    LOG_LEVEL,
    INTRO_ELIGIBILITY_STATUS,
} from 'react-native-purchases';
import { useSelector } from 'react-redux';
import { RootState, store } from '@/store';
import env from '@utils/env';
import { authActions } from '@features/auth/context/slice';

interface TrialEligibility {
    status: INTRO_ELIGIBILITY_STATUS;
    isLoading: boolean;
}
interface SubscriptionContextType {
    customerInfo: CustomerInfo | null;
    offerings: PurchasesOfferings | null;
    isSubscribed: boolean;
    isLoading: boolean;
    trialEligibility: TrialEligibility;
    purchasePackage: (pack: PurchasesPackage) => Promise<void>;
    restorePurchases: () => Promise<CustomerInfo | null>;
    refreshCustomerInfo: () => Promise<CustomerInfo | null>;
}


const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
    undefined
);

const PRODUCT_ID = 'premium_monthly_ios';

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [trialEligibility, setTrialEligibility] = useState<TrialEligibility>({
        status: INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN,
        isLoading: true,
    });

    console.log("trialEligibility-----", trialEligibility)

    const user = useSelector((state: RootState) => state['feature/auth'].user);

    useEffect(() => {
        const initializePurchases = async () => {
            try {
                Purchases.setLogLevel(LOG_LEVEL.DEBUG);


                const apiKey =
                    Platform.OS === 'ios'
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


                setCustomerInfo(info);
                updateSubscriptionStatus(info);
                setOfferings(offers);


                if (Platform.OS === 'ios') {
                    await refreshTrialEligibility();
                } else {
                    setTrialEligibility({
                        status: INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN,
                        isLoading: false,
                    });
                }
            } catch (error) {
                console.error('Error initializing RevenueCat:', error);
                setTrialEligibility(prev => ({ ...prev, isLoading: false }));
            } finally {
                setIsLoading(false);
            }
        };


        initializePurchases();
    }, [user?._id]);


    useEffect(() => {
        const customerInfoUpdateListener = (info: CustomerInfo) => {
            setCustomerInfo(info);
            updateSubscriptionStatus(info);
            if (Platform.OS === 'ios') {
                refreshTrialEligibility();
            }
        };


        Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);


        return () => {
            void Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
        };
    }, []);


    const refreshTrialEligibility = async () => {
        try {
            setTrialEligibility(prev => ({ ...prev, isLoading: true }));


            const result = await Purchases.checkTrialOrIntroductoryPriceEligibility(
                [PRODUCT_ID]
            );
            console.log("result>>>>", result)

            const status =
                result[PRODUCT_ID]?.status ??
                INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN;

            console.log("status>>>>", INTRO_ELIGIBILITY_STATUS)


            setTrialEligibility({ status, isLoading: false });
        } catch (error) {
            console.error('Error checking trial eligibility:', error);
            setTrialEligibility({
                status: INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN,
                isLoading: false,
            });
        }
    };


    const updateSubscriptionStatus = (info: CustomerInfo) => {
        const active =
            info.entitlements.active['Premium access'] !== undefined ||
            info.activeSubscriptions.length > 0;
        setIsSubscribed(active);
        store.dispatch(authActions.setSubscription({ status: active }));
    };


    const purchasePackage = async (pack: PurchasesPackage) => {
        try {
            let result;


            // if (discount && Platform.OS === 'ios') {
            //     result = await Purchases.purchaseDiscountedPackage(pack, discount);
            // } else {
            result = await Purchases.purchasePackage(pack);
            // }


            setCustomerInfo(result.customerInfo);
            updateSubscriptionStatus(result.customerInfo);
        } catch (error: any) {
            if (!error.userCancelled) {
                console.error('Error purchasing package:', error);
                throw error;
            }
        }
    };


    const restorePurchases = async () => {
        try {
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
            updateSubscriptionStatus(info);
            if (Platform.OS === 'ios') {
                await refreshTrialEligibility();
            }
            return info;
        } catch (error) {
            console.error('Error restoring purchases:', error);
            throw error;
        }
    };


    const refreshCustomerInfo = async () => {
        try {
            const info = await Purchases.getCustomerInfo();
            setCustomerInfo(info);
            updateSubscriptionStatus(info);
            return info;
        } catch (error) {
            console.error('Error refreshing customer info:', error);
            throw error;
        }
    };


    return (
        <SubscriptionContext.Provider
            value={{
                customerInfo,
                offerings,
                isSubscribed,
                isLoading,
                trialEligibility,
                purchasePackage,
                restorePurchases,
                refreshCustomerInfo,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
};


export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
