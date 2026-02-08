import axios from "axios";
import { notify } from "@/app/lib/notificationBus";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (method && method !== "get") {
      const description =
        response.data?.message ||
        response.data?.detail ||
        "Request completed successfully.";
      notify({
        type: "success",
        title: "Success",
        description,
      });
    }
    return response;
  },
  (error) => {
    const method = error?.config?.method?.toLowerCase();
    if (method && method !== "get") {
      const status = error?.response?.status;
      const data = error?.response?.data;
      const title =
        data?.error ||
        (status ? `Request failed (${status})` : "Request failed");
      const description =
        data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      notify({
        type: "error",
        title,
        description,
      });
    }
    return Promise.reject(error);
  }
);
