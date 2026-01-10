import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@components/atoms/Box';
import { selectAuthTokens } from '@features/auth/context/selectors';
import { authActions } from '@features/auth/context/slice';
import AppNavigator from '@navigation/AppNavigator';
import AuthNavigator from '@navigation/AuthNavigator';
import {
  getDecodedTokens,
  isTokenAboutToExpire,
  isTokenExpired,
  refreshAccessTokenFn,
} from '@utils/authhelpers';

const AppInitializer = () => {
  const dispatch = useDispatch();

  const [authencaticated, setAuthencaticated] = useState<boolean | null>(null);
  const { accessToken, refreshToken } = useSelector(selectAuthTokens);

  const authHandler = async () => {
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
            }
          } catch (error) {
            if (accessTokenIsExpired) {
              setAuthencaticated(false);
            } else {
              setAuthencaticated(true);
            }
          }
        }
      } else setAuthencaticated(false);
    } else {
      setAuthencaticated(false); // No token available
    }
  };

  useEffect(() => {
    if (authencaticated !== null) setAuthencaticated(null);

    if (accessToken && refreshToken) {
      authHandler();
    } else {
      setAuthencaticated(false);
    }
  }, [accessToken, refreshToken]);

  if (authencaticated === null)
    return <Box flex={1} backgroundColor="PrimaryGreen" />;
  if (authencaticated) return <AppNavigator />;

  return <AuthNavigator />;
};

export default AppInitializer;
