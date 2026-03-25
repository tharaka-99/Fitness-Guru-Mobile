import React, { useEffect } from "react";
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
import { SubscriptionProvider } from "@features/subscription/context/SubscriptionProvider";
import { enableScreens } from "react-native-screens";
enableScreens();


const queryClient = new QueryClient();

configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: true, // Reanimated runs in strict mode by default
});


export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={MD2DarkTheme}>
            <NavigationContainer theme={navigationTheme}>
              <ReduxProvider store={store}>
                <PersistGate persistor={reduxPersistor}>
                  <SubscriptionProvider>
                    <SafeAreaView style={styles.container}>
                      <StatusBar style="light" />
                      <AppInitializer />
                    </SafeAreaView>
                  </SubscriptionProvider>
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



