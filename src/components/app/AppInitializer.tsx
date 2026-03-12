import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, Image, Dimensions } from 'react-native';

import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

import Box from '@components/atoms/Box';
import OfflineModal from '@components/atoms/OfflineModal';
import { selectAuthTokens } from '@features/auth/context/selectors';
import { authActions } from '@features/auth/context/slice';
import AppNavigator from '@navigation/AppNavigator';
import AuthNavigator from '@navigation/AuthNavigator';
import CountdownGate from './CountdownGate';
import {
  getDecodedTokens,
  isTokenAboutToExpire,
  isTokenExpired,
  refreshAccessTokenFn,
} from '@utils/authhelpers';
import { theme } from '@utils/styles/theme';

const { width } = Dimensions.get('window');

const AppInitializer = () => {
  const dispatch = useDispatch();
  const netInfo = useNetInfo();

  const [authencaticated, setAuthencaticated] = useState<boolean | null>(null);
  const { accessToken, refreshToken } = useSelector(selectAuthTokens);

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
            return;
          }

          if (accessTokenIsExpired || accessTokenIsAboutToExpire) {
            try {
              const { data } = await refreshAccessTokenFn();
              if (!!data?.accessToken || !!data?.refreshToken) {
                dispatch(authActions.setAuthTokens(data));
                setAuthencaticated(true);
                return;
              } else {
                setAuthencaticated(false);
              }
            } catch (error) {
              if (accessTokenIsExpired) {
                setAuthencaticated(false);
              } else {
                setAuthencaticated(true);
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
      console.error('Auth handler error:', error);
      setAuthencaticated(false);
    }
  };

  useEffect(() => {
    if (netInfo.isConnected) {
      if (accessToken && refreshToken) {
        authHandler();
      } else {
        setAuthencaticated(false);
      }
    }
  }, [accessToken, refreshToken, netInfo.isConnected]);

  const handleRetry = () => {
    NetInfo.refresh();
  };

  const LAUNCH_DATE = new Date('2026-03-28T17:00:00');
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

    if (authencaticated === null)
      return (
        <Box
          flex={1}
          backgroundColor="PrimaryBlack"
          justifyContent="center"
          alignItems="center"
        >
          <Image
            source={require('assets/splash-icon-dark.png')}
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
    </>
  );
};

export default AppInitializer;
