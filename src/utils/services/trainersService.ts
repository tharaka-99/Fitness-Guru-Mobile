import api, { getApiForFormData } from "@utils/http/request";
import {
  CreateTrainerRequestDto,
  MealReRequestPayload,
  ReRequestEligibility,
  Trainer,
  TrainerPackage,
} from "@utils/types/trainersTypes";
import axios from "axios";

//
export const getTrainers = async (): Promise<Trainer[]> => {
  try {
    const response = await api.get("/trainer");
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const getTrainerPackagesById = async (
  trainerId: string
): Promise<TrainerPackage[]> => {
  try {
    const response = await api.get(`/trainer-package/${trainerId}`);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const postTrainerRequest = async (
  data: any
): Promise<CreateTrainerRequestDto> => {
  try {
    const response = await getApiForFormData().post("/trainer-request", data);

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          "An error occurred while requesting the trainer.";
        console.error("Error response data:", error.response.data);
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error("Error request:", error.request);
        throw new Error("No response received from the server.");
      } else {
        console.error("Error message:", error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
    throw error;
  }
};
//
export const postFitnessGuruRequest = async (
  formData: any
): Promise<CreateTrainerRequestDto> => {
  try {
    const response = await getApiForFormData().post(
      "/trainer-request/fitness-guru",
      formData
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          "An error occurred while requesting the trainer.";
        console.error("Error response data:", error.response.data);
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error("Error request:", error.request);
        throw new Error("No response received from the server.");
      } else {
        console.error("Error message:", error.message);
        throw new Error(`Error: ${error.message}`);
      }
    }
    throw error;
  }
};
//
export const getTrainerRequestById = async (
  trainerId: string
): Promise<any> => {
  try {
    const response = await api.get(
      `/trainer-request/trainer-request/${trainerId}`
    );

    return response.data.data;
  } catch (error) {
    throw error;
  }
};
//
export const getFitnessGuruRequest = async (): Promise<any> => {
  try {
    const response = await api.get(`/trainer-request/fitness-guru-request`);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getScheduleReRequestEligibility =
  async (): Promise<ReRequestEligibility> => {
    try {
      const response = await api.get(
        "/trainer-request/schedule-re-request/eligibility"
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  };

export const postWorkoutReRequest = async (
  formData: FormData
): Promise<any> => {
  try {
    const response = await getApiForFormData().post(
      "/trainer-request/schedule-re-request/workout",
      formData
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.log("🚨 Server Error Status:", error.response.status);
        console.log("🚨 Server Raw Response Data:", error.response.data);
        throw new Error(
          error.response.data?.message || "Error creating workout re-request"
        );
      }
    }
    throw error;
  }
};

export const postMealReRequest = async (
  payload: MealReRequestPayload
): Promise<any> => {
  try {
    const response = await api.post(
      "/trainer-request/schedule-re-request/meal",
      payload
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data?.message || "Error creating meal re-request"
        );
      }
    }
    throw error;
  }
};
