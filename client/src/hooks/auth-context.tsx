import { createContext } from "react";


interface User {
  email: string;
  role?: "USER" | "ADMIN";
  apikey: string;
}


interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
