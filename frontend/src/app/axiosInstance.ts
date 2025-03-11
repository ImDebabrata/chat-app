import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  if (loggedInUser?.token) {
    config.headers.Authorization = `Bearer ${loggedInUser?.token}`;
  }
  return config;
});

export default axiosInstance;
