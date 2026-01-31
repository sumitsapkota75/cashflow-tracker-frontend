import axios from "axios";

export const api = axios.create({
  baseURL: "http://10.2.1.227:8080",
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});