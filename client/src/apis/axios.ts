import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { secureStorage } from "@/utils/security";
import { isTokenExpired } from "@/types/auth.types";

/**
 * Secure Axios instance for Kutt API
 * 
 * Security features:
 * - Automatic token injection from secure storage
 * - Token expiry validation before requests
 * - CSRF protection headers
 * - Automatic logout on 401 responses
 * - Request/Response error handling
 */

// Validate environment variable exists
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.PROD) {
  console.warn(
    "[Security Warning] VITE_API_BASE_URL not configured. Using default localhost."
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookie-based auth
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor - attach token and validate expiry
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = secureStorage.getToken();

    if (token) {
      // Check if token is expired before sending request
      if (isTokenExpired(token)) {
        secureStorage.clear();
        // Redirect to login if on a protected route
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/signup"
        ) {
          window.location.href = "/login?session=expired";
        }
        return Promise.reject(new Error("Token expired"));
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add custom header for API identification
    config.headers["X-Client-Version"] = "1.0.0";
    config.headers["X-Request-ID"] = crypto.randomUUID();

    return config;
  },
  (error) => {
    console.error("[API Request Error]:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      console.error("[Network Error]:", error.message);
      return Promise.reject({
        message: "Network error. Please check your connection.",
        isNetworkError: true,
      });
    }

    const { status, data } = error.response;

    // Handle authentication errors
    if (status === 401) {
      secureStorage.clear();

      // Only redirect if not already on auth pages
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup"
      ) {
        window.location.href = "/login?session=expired";
      }
    }

    // Handle forbidden errors
    if (status === 403) {
      console.warn("[Forbidden]:", data);
    }

    // Handle rate limiting
    if (status === 429) {
      console.warn("[Rate Limited]:", data);
      return Promise.reject({
        message: "Too many requests. Please wait a moment and try again.",
        isRateLimited: true,
      });
    }

    // Handle server errors
    if (status >= 500) {
      console.error("[Server Error]:", data);
      return Promise.reject({
        message: "Server error. Please try again later.",
        isServerError: true,
      });
    }

    return Promise.reject(error);
  }
);

export default api;

/**
 * Type-safe API error handler
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    return (
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      "An unexpected error occurred"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}
