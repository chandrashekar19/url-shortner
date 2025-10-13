import { useContext } from "react";
import { AuthContext } from "./auth-context";

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



export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};