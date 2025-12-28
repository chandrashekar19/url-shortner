import api, { getApiErrorMessage } from "./axios";

/**
 * Domain data structure
 */
export interface DomainData {
  id: number;
  uuid: string;
  address: string;
  homepage?: string;
  banned: boolean;
  created_at: string;
  updated_at: string;
  links_count?: number;
}

/**
 * Paginated domains response
 */
export interface DomainsResponse {
  limit: number;
  skip: number;
  total: number;
  data: DomainData[];
}

/**
 * Get user's domains
 */
export const getDomains = async (): Promise<DomainData[]> => {
  try {
    const { data } = await api.get<DomainData[]>("/domains");
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Get all domains (admin only)
 */
export const getDomainsAdmin = async (
  limit = 10,
  skip = 0,
  options?: {
    search?: string;
    banned?: boolean;
  }
): Promise<DomainsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());

    if (options?.search) params.append("search", options.search);
    if (options?.banned !== undefined)
      params.append("banned", options.banned.toString());

    const { data } = await api.get<DomainsResponse>(`/domains/admin?${params}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Add a new domain
 */
export const addDomain = async (
  address: string,
  homepage?: string
): Promise<DomainData> => {
  try {
    const { data } = await api.post<DomainData>("/domains", {
      address,
      ...(homepage && { homepage }),
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Delete a domain
 */
export const deleteDomain = async (id: string): Promise<{ message: string }> => {
  try {
    const { data } = await api.delete<{ message: string }>(`/domains/${id}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Add domain as admin
 */
export const addDomainAdmin = async (domain: {
  address: string;
  homepage?: string;
  banned?: boolean;
}): Promise<DomainData> => {
  try {
    const { data } = await api.post<DomainData>("/domains/admin", domain);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Ban a domain (admin only)
 */
export const banDomain = async (
  id: number,
  options?: {
    links?: boolean;
  }
): Promise<{ message: string }> => {
  try {
    const { data } = await api.post<{ message: string }>(
      `/domains/admin/ban/${id}`,
      options || {}
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

/**
 * Delete domain as admin
 */
export const deleteDomainAdmin = async (
  id: number,
  deleteLinks = false
): Promise<{ message: string }> => {
  try {
    const params = deleteLinks ? "?links=true" : "";
    const { data } = await api.delete<{ message: string }>(
      `/domains/admin/${id}${params}`
    );
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
