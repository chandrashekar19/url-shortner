import api from "./axios";

export interface Link {
  id: string;
  shortUrl: string;
  target: string;
}

export interface LinkResponse {
  limit: number;
  skip: number;
  total: number;
  data: Link[];
}

export const getLinks = async (
  limit = 10,
  skip = 0
): Promise<LinkResponse> => {
  const { data } = await api.get<LinkResponse>(`/links?limit=${limit}&skip=${skip}`);
  return data;
};
