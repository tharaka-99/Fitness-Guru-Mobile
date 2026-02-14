import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
    CustomerInfo,
    PurchasesOfferings,
    PurchasesPackage,
    LOG_LEVEL,
} from 'react-native-purchases';
import { useSelector } from 'react-redux';
import { RootState, store } from '@/store';
import env from '@utils/env';
import { authActions } from '@features/auth/context/slice';

interface SubscriptionContextType {
    customerInfo: CustomerInfo | null;
    offerings: PurchasesOfferings | null;
    isSubscribed: boolean;
    isLoading: boolean;
    purchasePackage: (pack: PurchasesPackage) => Promise<void>;
    restorePurchases: () => Promise<CustomerInfo | null>;
    refreshCustomerInfo: () => Promise<CustomerInfo | null>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
    undefined
);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const user = useSelector((state: RootState) => state['feature/auth'].user);

    useEffect(() => {
        const initializePurchases = async () => {
            try {
                Purchases.setLogLevel(LOG_LEVEL.DEBUG);

                const apiKey =
                    Platform.OS === 'ios'
                        ? env.EXPO_PUBLIC_RC_IOS
                        : env.EXPO_PUBLIC_RC_ANDROID;

                if (apiKey) {
                    Purchases.configure({
                        apiKey,
                        appUserID: user?._id || undefined,
                    });

                    const info = await Purchases.getCustomerInfo();
                    setCustomerInfo(info);
                    updateSubscriptionStatus(info);

                    const offers = await Purchases.getOfferings();
                    setOfferings(offers);
                }
            } catch (error) {
                console.error('Error initializing RevenueCat:', error);
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
        };

        Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

        return () => {
            Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
        };
    }, []);

    const updateSubscriptionStatus = (info: CustomerInfo) => {
        const active =
            info.entitlements.active['Premium access'] !== undefined ||
            info.activeSubscriptions.length > 0;
        setIsSubscribed(active);
        store.dispatch(authActions.setSubscription({ status: active }));
    };

    const purchasePackage = async (pack: PurchasesPackage) => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            setCustomerInfo(customerInfo);
            updateSubscriptionStatus(customerInfo);
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
        throw new Error(
            'useSubscription must be used within a SubscriptionProvider'
        );
    }
    return context;
};
