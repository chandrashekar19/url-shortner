import api from "./axios";

export interface User {
  apikey: string;
  email: string;
  domains: { address: string; homepage: string }[];
}

export const getUserInfo = async (): Promise<User> => {
  const { data } = await api.get<User>("/users");
  return data;
};
