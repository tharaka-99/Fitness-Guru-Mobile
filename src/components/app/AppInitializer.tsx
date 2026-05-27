import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, Image, Dimensions } from "react-native";

import NetInfo, { useNetInfo } from "@react-native-community/netinfo";

import Box from "@components/atoms/Box";
import OfflineModal from "@components/atoms/OfflineModal";
import { selectAuthTokens } from "@features/auth/context/selectors";
import { authActions } from "@features/auth/context/slice";
import AppNavigator from "@navigation/AppNavigator";
import AuthNavigator from "@navigation/AuthNavigator";
import CountdownGate from "./CountdownGate";
import {
  getDecodedTokens,
  isTokenAboutToExpire,
  isTokenExpired,
  refreshAccessTokenFn,
} from "@utils/authhelpers";
import { theme } from "@utils/styles/theme";
import {
  ensurePushTokenRegistered,
  subscribeToForegroundFCM,
  subscribeToTokenRefresh,
} from "@utils/services/notificationService";
import ForceUpdateModal from "@components/atoms/ForceUpdateModal";
import { checkAppVersion } from "@utils/services/versionCheckService";

const { width } = Dimensions.get("window");

const AppInitializer = () => {
  const dispatch = useDispatch();
  const netInfo = useNetInfo();

  const [authencaticated, setAuthencaticated] = useState<boolean | null>(null);
  const { accessToken, refreshToken } = useSelector(selectAuthTokens);

  const [checkingVersion, setCheckingVersion] = useState<boolean>(true);
  const [updateInfo, setUpdateInfo] = useState<{
    required: boolean;
    current: string;
    latest: string;
    storeUrl: string;
  } | null>(null);

  const authHandler = async () => {
    // Don't attempt to authenticate if we're known to be offline
    if (netInfo.isConnected === false) return;

    try {
      const decoded = getDecodedTokens({ accessToken, refreshToken });

      if (decoded?.tokenAvailable) {
        const refreshTokenIsExpired = isTokenExpired(decoded.refreshToken);
        const accessTokenIsExpired = isTokenExpired(decoded.accessToken);
        const accessTokenIsAboutToExpire = isTokenAboutToExpire(
          decoded.accessToken
        );

        if (!refreshTokenIsExpired) {
          if (!accessTokenIsExpired && !accessTokenIsAboutToExpire) {
            setAuthencaticated(true);
            // User is authenticated and tokens are valid; ensure push token is registered
            ensurePushTokenRegistered();
            return;
          }

          if (accessTokenIsExpired || accessTokenIsAboutToExpire) {
            try {
              const { data } = await refreshAccessTokenFn();
              if (!!data?.accessToken || !!data?.refreshToken) {
                dispatch(authActions.setAuthTokens(data));
                setAuthencaticated(true);
                // After refreshing tokens, also ensure push token is registered
                ensurePushTokenRegistered();
                return;
              } else {
                setAuthencaticated(false);
              }
            } catch (error) {
              if (accessTokenIsExpired) {
                setAuthencaticated(false);
              } else {
                setAuthencaticated(true);
                // Even if refresh failed but access token is still valid, try registering push
                ensurePushTokenRegistered();
              }
            }
          }
        } else {
          setAuthencaticated(false);
        }
      } else {
        setAuthencaticated(false); // No token available
      }
    } catch (error) {
      console.error("Auth handler error:", error);
      setAuthencaticated(false);
    }
  };

  // Subscribe to FCM token refresh once for the app lifecycle
  useEffect(() => {
    const unsubscribe = subscribeToTokenRefresh();
    return () => unsubscribe();
  }, []);

  // Foreground: FCM does not show system trays — show in-app toast instead
  useEffect(() => {
    const unsubscribe = subscribeToForegroundFCM();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (netInfo.isConnected) {
      if (accessToken && refreshToken) {
        authHandler();
      } else {
        setAuthencaticated(false);
      }
    }
  }, [accessToken, refreshToken, netInfo.isConnected]);

  useEffect(() => {
    const runVersionCheck = async () => {
      if (netInfo.isConnected === false) return;
      try {
        const result = await checkAppVersion({
          // Set to a mock latest version if you want to test the force update prompt, e.g.:
          // mockLatestVersion: "1.0.5",
          //forceMock: true,
        });
        setUpdateInfo({
          required: result.updateRequired,
          current: result.currentVersion,
          latest: result.latestVersion,
          storeUrl: result.storeUrl,
        });
      } catch (error) {
        console.error("Failed to run version check:", error);
      } finally {
        setCheckingVersion(false);
      }
    };

    if (netInfo.isConnected) {
      runVersionCheck();
    }
  }, [netInfo.isConnected]);

  const handleRetry = () => {
    NetInfo.refresh();
  };

  const LAUNCH_DATE = new Date("2026-03-28T17:00:00");
  const [showCountdown, setShowCountdown] = useState<boolean>(false);

  useEffect(() => {
    const now = new Date();
    if (now < LAUNCH_DATE) {
      setShowCountdown(true);
    }
  }, []);

  const renderContent = () => {
    if (showCountdown) {
      return (
        <CountdownGate
          launchDate={LAUNCH_DATE}
          onLaunch={() => setShowCountdown(false)}
          onBypass={() => setShowCountdown(false)}
        />
      );
    }

    if (checkingVersion && netInfo.isConnected !== false) {
      return (
        <Box
          flex={1}
          backgroundColor="PrimaryBlack"
          justifyContent="center"
          alignItems="center"
        >
          <Image
            source={require("assets/splash-icon-dark.png")}
            style={{
              width: width * 0.4,
              height: width * 0.4,
              marginBottom: 24,
            }}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color={theme.colors.PrimaryGreen} />
        </Box>
      );
    }

    if (authencaticated === null)
      return (
        <Box
          flex={1}
          backgroundColor="PrimaryBlack"
          justifyContent="center"
          alignItems="center"
        >
          <Image
            source={require("assets/splash-icon-dark.png")}
            style={{
              width: width * 0.4,
              height: width * 0.4,
              marginBottom: 24,
            }}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color={theme.colors.PrimaryGreen} />
        </Box>
      );
    if (authencaticated) return <AppNavigator />;

    return <AuthNavigator />;
  };

  return (
    <>
      {renderContent()}
      <OfflineModal
        isVisible={netInfo.isConnected === false}
        onRetry={handleRetry}
      />
      {updateInfo?.required && (
        <ForceUpdateModal
          isVisible={updateInfo.required}
          storeUrl={updateInfo.storeUrl}
          currentVersion={updateInfo.current}
          latestVersion={updateInfo.latest}
        />
      )}
    </>
  );
};

export default AppInitializer;
