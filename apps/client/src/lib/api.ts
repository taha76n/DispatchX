import axios from "axios";
import { ApiError } from "./apiError";

const params = new URLSearchParams(window.location.search);
const port = params.get("port") ?? "4000";
const Base_URL = `http://localhost:${port}/api/v1`;

export const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL: Base_URL,
  timeout: 10000,
  withCredentials: true,
});


api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
        throw new ApiError(error.response.data.message, error.response.status);
    } else {
      throw new ApiError("NETWORK_ERROR", 0);
    }
  }
);
