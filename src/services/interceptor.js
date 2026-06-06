// interceptor.js
import axios from "axios";
import { store } from "../store";
import { clearUser } from "../components/auth/store/userSlice";

let isRefreshing = false;
let failedQueue = [];

// ---- Queue helpers ----
const processQueue = (error = null) => {
  failedQueue.forEach(promise => {
    if (error) promise.reject(error);
    else promise.resolve();
  });
  failedQueue = [];
};

// ---- Refresh API instance ----
const refreshApi = axios.create({
  baseURL: process.env.REACT_APP_AUTH_BASE_URL,
  withCredentials: true // REQUIRED for HttpOnly cookies
});

// ---- Refresh call (COOKIE BASED) ----
async function refreshAccessToken() {

  await refreshApi.post(
    "/candidate-auth/refresh-token",
    null,
    {
      headers: { "X-Client": "candidate" },
      withCredentials: true
    }
  );

}

// ---- Apply interceptors ----
export function applyInterceptors(axiosInstance) {

  // ---------------- REQUEST ----------------
  axiosInstance.interceptors.request.use(
    config => {
      // ALWAYS send cookies
      config.withCredentials = true;
      return config;
    },
    error => {
      throw error;
    }
  );

  // ---------------- RESPONSE ----------------
  axiosInstance.interceptors.response.use(
    response => response.data,

    async error => {
      const originalRequest = error.config;
      const status = error.response?.status;

      // Not unauthorized or already retried → fail fast
      if ((status !== 401 && status !== 403) || originalRequest._retry) {
        throw error;
      }

      originalRequest._retry = true;

      // If refresh already in progress → queue request
      if (isRefreshing) {

        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        await refreshAccessToken();

        processQueue();

        return axiosInstance(originalRequest);

      } catch (refreshError) {

        processQueue(refreshError);
        store.dispatch(clearUser());
        window.location.href = "/login";

        throw refreshError;

      } finally {
        isRefreshing = false;
      }
    }
  );
}
