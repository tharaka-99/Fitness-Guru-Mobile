import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "@shopify/restyle";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD2DarkTheme, PaperProvider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { reduxPersistor, store } from "@/store";
import AppInitializer from "@components/app/AppInitializer";
import navigationTheme from "@navigation/theme";
import { theme } from "@utils/styles/theme";

import { QueryClient, QueryClientProvider } from "react-query";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { useEffect } from "react";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { authActions } from "@features/auth/context/slice";
import { enableScreens } from "react-native-screens";
import env from "./src/utils/env";
enableScreens();

const queryClient = new QueryClient();

configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: true, // Reanimated runs in strict mode by default
});

export default function App() {
  //configure revenue cat
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    try {
      if (Platform.OS === "ios") {
        Purchases.configure({
          apiKey: "appl_xaIghnPYoNgfePDjSrzcubzjzqw",
          // apiKey: env.EXPO_PUBLIC_RC_IOS,
        });
      } else if (Platform.OS === "android") {
        Purchases.configure({
          apiKey: "goog_oyzmPsavutQJnKUwqqOOEiSLioN",
          // apiKey: env.EXPO_PUBLIC_RC_ANDROID,
        });
      }

      fetchProducts();
      getCustomerInfo();
    } catch (error) {
      console.error("RevenueCat configuration error:", error);
    }
  }, []);

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log("CUSTOMER INFO", JSON.stringify(customerInfo));
  }

  const fetchProducts = async () => {
    try {
      const products = await Purchases.getProducts(["rc_fg_premium_monthly"]);
      const offerings = await Purchases.getOfferings();
      console.log(
        "PRODUCTSSSSSS",
        JSON.stringify(offerings.current?.availablePackages)
      );
      if (offerings) {
        const customerInfo = await Purchases.getCustomerInfo();
        if (customerInfo.activeSubscriptions.length > 0) {
          store.dispatch(authActions.setSubscription({ status: true }));
        } else {
          store.dispatch(authActions.setSubscription({ status: false }));
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Revenuecat issue",
          text2: "No offerings found!",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Revenuecat issue",
        text2: (error as Error)?.message || "Error configure Revenuecat",
      });
      console.error("Error fetching offerings:", JSON.stringify(error));
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={MD2DarkTheme}>
            <NavigationContainer theme={navigationTheme}>
              <ReduxProvider store={store}>
                <PersistGate persistor={reduxPersistor}>
                  <SafeAreaView style={styles.container}>
                    <StatusBar style="light" />
                    <AppInitializer />
                  </SafeAreaView>
                </PersistGate>
              </ReduxProvider>
            </NavigationContainer>
            <Toast />
          </PaperProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
  },
});
