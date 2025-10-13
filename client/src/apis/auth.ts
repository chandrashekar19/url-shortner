import api from "./axios";

export interface AuthResponse {
  apikey: string;
  email: string;
  role?: "USER" | "ADMIN";
}

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
};

export const signupApi = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/signup", { email, password });
  return data;
};
