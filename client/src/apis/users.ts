import api, { getApiErrorMessage } from "./axios";

/**
 * User data structure
 */
export interface UserData {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
  banned: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
  links_count?: number;
}

/**
 * Paginated users response
 */
export interface UsersResponse {
  limit: number;
  skip: number;
  total: number;
  data: UserData[];
}

/**
 * Current user info
 */
export interface CurrentUserInfo {
  email: string;
  role: "USER" | "ADMIN";
  domains: number;
  links: number;
  apikey?: string;
}

/**
 * Get current user info
 */
export const getUserInfo = async (): Promise<CurrentUserInfo> => {
  try {
    const { data } = await api.get<CurrentUserInfo>("/users/me");
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Get all users (admin only)
 */
export const getUsersAdmin = async (
  limit = 10,
  skip = 0,
  options?: {
    search?: string;
    banned?: boolean;
    admin?: boolean;
  }
): Promise<UsersResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());

    if (options?.search) params.append("search", options.search);
    if (options?.banned !== undefined)
      params.append("banned", options.banned.toString());
    if (options?.admin !== undefined)
      params.append("admin", options.admin.toString());

    const { data } = await api.get<UsersResponse>(`/users/admin?${params}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Create a new user (admin only)
 */
export const createUser = async (user: {
  email: string;
  password: string;
  role?: "USER" | "ADMIN";
  verified?: boolean;
}): Promise<UserData> => {
  try {
    const { data } = await api.post<UserData>("/users/admin", user);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Ban a user (admin only)
 */
export const banUser = async (
  id: number,
  options?: {
    links?: boolean;
    domains?: boolean;
  }
): Promise<{ message: string }> => {
  try {
    const { data } = await api.post<{ message: string }>(
      `/users/admin/ban/${id}`,
      options || {}
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (id: number): Promise<{ message: string }> => {
  try {
    const { data } = await api.delete<{ message: string }>(`/users/admin/${id}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Delete current user account
 */
export const deleteAccount = async (
  password: string
): Promise<{ message: string }> => {
  try {
    const { data } = await api.delete<{ message: string }>("/users/me", {
      data: { password },
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
