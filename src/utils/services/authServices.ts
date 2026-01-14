import { store } from "@/store";
import { authActions } from "@features/auth/context/slice";
import { gymActions } from "@features/gym/context/slice";
import { overviewActions } from "@features/overview/context/slice";

import api, { getApiForFormData } from "@utils/http/request";
import { ClientInfo, Credentials, Profile, UserData } from "@utils/types/types";

export const clientUserLogin = async (credentials: Credentials) => {
  try {
    console.log("calling sign in");
    const response = await api.post("/client/login", credentials);
    const { accessToken, refreshToken } = response?.data?.data;
    const clientData = {
      ...response?.data?.data?.client,
      subscription: { status: false },
    };

    store.dispatch(authActions.setAuthTokens({ accessToken, refreshToken }));
    store.dispatch(authActions.setUser(clientData));
    store.dispatch(gymActions.resetWorkouts());
    store.dispatch(gymActions.resetMeals());

    return response.data;
  } catch (error) {
    throw error;
  }
};
//
export const clientUserRegister = async (userData: UserData): Promise<any> => {
  try {
    console.log("calling sign up");

    const response = await api.post("/client/register", userData);

    const { accessToken, refreshToken } = response.data.data;
    const clientData = {
      ...response?.data?.data?.client,
      subscription: { status: false },
    };

    store.dispatch(authActions.setAuthTokens({ accessToken, refreshToken }));
    store.dispatch(authActions.setUser(clientData));
    store.dispatch(gymActions.resetWorkouts());
    store.dispatch(gymActions.resetMeals());

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//
export const getClientProfileInfo = async (): Promise<Profile> => {
  try {
    const response = await api.get("/client/profile");
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const setClientProfileInfo = async (
  clientInfo: ClientInfo
): Promise<Profile> => {
  try {
    const response = await api.post("client/add-info", clientInfo);
    const updatedClientInfo = {
      personalInfo: response?.data?.data?.personalInfo,
      fitnessInfo: response?.data?.data?.fitnessInfo,
      calculatedMetrics: response?.data?.data?.calculatedMetrics,
      isInjured: response?.data?.data?.isInjured,
    };
    store.dispatch(authActions.setClientInfo(updatedClientInfo));
    return response.data;
  } catch (error) {
    throw error;
  }
};
//
export const uploadProfileImage = async (formData: any) => {
  try {
    console.log("uploadProfileImage called with FormData");
    console.log("Making API call to /client/upload-profile-image");
    const response = await getApiForFormData().post(
      "/client/upload-profile-image",
      formData
    );
    console.log("API call successful, response:", response);
    return response.data;
  } catch (error) {
    console.error("uploadProfileImage error:", error);
    throw error;
  }
};
