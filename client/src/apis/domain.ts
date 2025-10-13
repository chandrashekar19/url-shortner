import api from "./axios";

export interface Domain {
  address: string;
  homepage?: string;
}

export const createDomain = async (domain: Domain): Promise<Domain> => {
  const { data } = await api.post<Domain>("/domains", domain);
  return data;
};
