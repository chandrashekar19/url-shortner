import api, { getApiErrorMessage } from "./axios";

/**
 * Authentication API services
 * Handles login, signup, and token verification
 */

export interface LoginResponse {
  token: string;
  email: string;
  message?: string;
}

export interface SignupResponse {
  message: string;
  email: string;
}

export interface UserInfoResponse {
  email: string;
  role: "USER" | "ADMIN";
  domains: number;
  links: number;
  apikey?: string;
}

/**
 * Login user with email and password
 */
export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Register new user
 */
export const signupApi = async (
  email: string,
  password: string
): Promise<SignupResponse> => {
  try {
    const { data } = await api.post<SignupResponse>("/auth/signup", {
      email: email.trim().toLowerCase(),
      password,
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Create initial admin user
 */
export const createAdminApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const { data } = await api.post<LoginResponse>("/auth/create-admin", {
      email: email.trim().toLowerCase(),
      password,
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Get current user info from server
 * Used to verify token and get user role
 */
export const getUserInfoApi = async (): Promise<UserInfoResponse> => {
  try {
    const { data } = await api.get<UserInfoResponse>("/auth/me");
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Request password reset
 */
export const requestPasswordResetApi = async (
  email: string
): Promise<{ message: string }> => {
  try {
    const { data } = await api.post<{ message: string }>("/auth/reset-password", {
      email: email.trim().toLowerCase(),
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Set new password after reset
 */
export const setNewPasswordApi = async (
  reset_password_token: string,
  new_password: string,
  repeat_password: string
): Promise<{ message: string; email: string }> => {
  try {
    const { data } = await api.post<{ message: string; email: string }>(
      "/auth/new-password",
      {
        reset_password_token,
        new_password,
        repeat_password,
      }
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Change current user's password
 */
export const changePasswordApi = async (
  currentpassword: string,
  newpassword: string
): Promise<{ message: string }> => {
  try {
    const { data } = await api.post<{ message: string }>("/auth/change-password", {
      currentpassword,
      newpassword,
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Generate new API key
 */
export const generateApiKeyApi = async (): Promise<{
  message: string;
  apikey: string;
}> => {
  try {
    const { data } = await api.post<{ message: string; apikey: string }>(
      "/auth/apikey"
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
