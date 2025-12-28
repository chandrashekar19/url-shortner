import { useContext } from "react";
import { AuthContext } from "./auth-context";
import type { AuthContextType } from "@/types/auth.types";

/**
 * Custom hook for accessing authentication context
 * 
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType with user, login, logout, and loading states
 * 
 * @example
 * const { user, isAuthenticated, login, logout, isLoading } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider. " +
      "Wrap your component tree with <AuthProvider> in App.tsx"
    );
  }

  return context;
};