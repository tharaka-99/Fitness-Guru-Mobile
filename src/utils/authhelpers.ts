import { jwtDecode, JwtPayload } from "jwt-decode";
import axios from "axios";
import "core-js/stable/atob";

import { IAuthTokens, InitialState } from "@features/auth/context/slice";
import { store } from "@/store";
import env from "./env";

export function getDecodedTokens({ accessToken, refreshToken }: IAuthTokens) {
  const decodedTokens: {
    tokenAvailable: boolean;
    accessToken?: any;
    refreshToken?: any;
  } = {
    tokenAvailable: true,
  };

  if (!accessToken || !refreshToken) {
    decodedTokens.tokenAvailable = false;
    return { ...decodedTokens };
  }

  try {
    decodedTokens.accessToken = jwtDecode<JwtPayload>(accessToken);
    decodedTokens.refreshToken = jwtDecode<JwtPayload>(refreshToken);
  } catch (error) {
    decodedTokens.tokenAvailable = false;
  }

  return { ...decodedTokens };
}

export function isTokenExpired(token: any) {
  if (token && token.exp) {
    const expiryTimestamp = token.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTimestamp;
  }

  return true; // If the token or expiry time is not available, consider it as expired
}

export const isTokenAboutToExpire = (token: any) => {
  if (token && token.exp) {
    const expiryTimestamp = token.exp * 1000;
    const currentTimestamp = Date.now();
    const xHoursFromNow = currentTimestamp + 5 * 60 * 60 * 1000; // 5 hours from now

    return xHoursFromNow >= expiryTimestamp;
  }

  return true;
};

// --------- Refresh Token ---------
const NewRequest = axios.create({
  baseURL: env.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
NewRequest.interceptors.request.use((config) => {
  const auth: InitialState = store.getState()["feature/auth"];
  config.headers.set("Authorization", `Bearer ${auth?.tokens?.refreshToken}`);
  return config;
});
export async function refreshAccessTokenFn() {
  const data = await NewRequest<RefreshFnRes>({
    method: "post",
    url: "/refreshToken",
  });
  return data.data;
}
interface RefreshFnRes {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
