import axios from "axios";
import { getToken } from "./auth";
import { HTTP_BACKEND_URL } from "../config/config";

const api = axios.create({
  baseURL: HTTP_BACKEND_URL,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
