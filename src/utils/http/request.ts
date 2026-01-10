import axios from 'axios';
import { store } from '@/store';

import { InitialState, authActions } from '@features/auth/context/slice';
import { refreshAccessTokenFn } from '@utils/authhelpers';
import env from '@utils/env';

const Request = axios.create({
  baseURL: env.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

Request.interceptors.request.use((config) => {
  const auth: InitialState = store.getState()['feature/auth'];
  config.headers.set('Authorization', `Bearer ${auth?.tokens?.accessToken}`);
  return config;
});

Request.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const auth: InitialState = store.getState()['feature/auth'];
    const originalRequest = error.config;

    const userLoggedIn =
      !!auth?.tokens?.accessToken && !!auth?.tokens?.refreshToken;

    if (
      error?.response?.status === 401 &&
      !originalRequest?._retry &&
      userLoggedIn
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await refreshAccessTokenFn();

        if (data?.accessToken && data?.refreshToken) {
          store.dispatch(authActions.setAuthTokens(data));

          Request.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${data?.accessToken}`;

          return Request(originalRequest);
        }
      } catch (error) {
        store.dispatch(authActions.clearAuth());

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default Request;

// Form-data specific Axios instance
export const getApiForFormData = () => {
  const instance = axios.create({
    baseURL: env.baseURL,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const auth: InitialState = store.getState()['feature/auth'];
      config.headers.set(
        'Authorization',
        `Bearer ${auth?.tokens?.accessToken}`
      );
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const auth: InitialState = store.getState()['feature/auth'];
      const originalRequest = error.config;
      const userLoggedIn =
        !!auth?.tokens?.accessToken && !!auth?.tokens?.refreshToken;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        userLoggedIn
      ) {
        originalRequest._retry = true;

        try {
          const { data } = await refreshAccessTokenFn();

          if (data?.accessToken && data?.refreshToken) {
            store.dispatch(authActions.setAuthTokens(data));
            instance.defaults.headers[
              'Authorization'
            ] = `Bearer ${data.accessToken}`;
            originalRequest.headers[
              'Authorization'
            ] = `Bearer ${data.accessToken}`;

            return instance(originalRequest);
          }
        } catch (err) {
          store.dispatch(authActions.clearAuth());
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
