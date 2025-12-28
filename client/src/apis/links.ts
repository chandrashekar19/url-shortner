import api, { getApiErrorMessage } from "./axios";

/**
 * Link data structure from API
 */
export interface LinkData {
  id: string;
  address: string;
  target: string;
  description?: string;
  link: string;
  banned: boolean;
  created_at: string;
  updated_at: string;
  visit_count: number;
  password?: boolean;
}

/**
 * Paginated links response
 */
export interface LinksResponse {
  limit: number;
  skip: number;
  total: number;
  data: LinkData[];
}

/**
 * Create link request
 */
export interface CreateLinkRequest {
  target: string;
  customurl?: string;
  password?: string;
  description?: string;
  domain?: string;
  expire_in?: string;
  reuse?: boolean;
}

/**
 * Link stats response
 */
export interface LinkStatsResponse extends LinkData {
  browser: Array<{ name: string; value: number }>;
  os: Array<{ name: string; value: number }>;
  country: Array<{ name: string; value: number }>;
  referrer: Array<{ name: string; value: number }>;
}

/**
 * Get user's links with pagination
 */
export const getLinks = async (
  limit = 10,
  skip = 0,
  search?: string
): Promise<LinksResponse> => {
  try {
    let url = `/links?limit=${limit}&skip=${skip}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const { data } = await api.get<LinksResponse>(url);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Get all links (admin only)
 */
export const getLinksAdmin = async (
  limit = 10,
  skip = 0,
  options?: {
    search?: string;
    user?: string;
    domain?: string;
    banned?: boolean;
    anonymous?: boolean;
  }
): Promise<LinksResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());

    if (options?.search) params.append("search", options.search);
    if (options?.user) params.append("user", options.user);
    if (options?.domain) params.append("domain", options.domain);
    if (options?.banned !== undefined)
      params.append("banned", options.banned.toString());
    if (options?.anonymous !== undefined)
      params.append("anonymous", options.anonymous.toString());

    const { data } = await api.get<LinksResponse>(`/links/admin?${params}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Create a new short link
 */
export const createLink = async (
  request: CreateLinkRequest
): Promise<LinkData> => {
  try {
    const { data } = await api.post<LinkData>("/links", {
      target: request.target,
      ...(request.customurl && { customurl: request.customurl }),
      ...(request.password && { password: request.password }),
      ...(request.description && { description: request.description }),
      ...(request.domain && { domain: request.domain }),
      ...(request.expire_in && { expire_in: request.expire_in }),
      ...(request.reuse && { reuse: request.reuse }),
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Update a link
 */
export const updateLink = async (
  id: string,
  updates: Partial<{
    target: string;
    address: string;
    description: string;
    password: string;
    expire_in: string;
  }>
): Promise<{ message: string }> => {
  try {
    const { data } = await api.patch<{ message: string }>(`/links/${id}`, updates);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Delete a link
 */
export const deleteLink = async (id: string): Promise<{ message: string }> => {
  try {
    const { data } = await api.delete<{ message: string }>(`/links/${id}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Get link statistics
 */
export const getLinkStats = async (id: string): Promise<LinkStatsResponse> => {
  try {
    const { data } = await api.get<LinkStatsResponse>(`/links/${id}/stats`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Report a link for abuse
 */
export const reportLink = async (
  link: string
): Promise<{ message: string }> => {
  try {
    const { data } = await api.post<{ message: string }>("/links/report", {
      link,
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Access password-protected link
 */
export const accessProtectedLink = async (
  id: string,
  password: string
): Promise<{ target: string }> => {
  try {
    const { data } = await api.post<{ target: string }>(
      `/links/${id}/protected`,
      { password }
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Ban a link (admin only)
 */
export const banLink = async (
  id: string,
  options?: {
    host?: boolean;
    user?: boolean;
    userLinks?: boolean;
    domain?: boolean;
  }
): Promise<{ message: string }> => {
  try {
    const { data } = await api.post<{ message: string }>(
      `/links/admin/ban/${id}`,
      options || {}
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
