import { createContext } from "react";
import type { AuthContextType } from "@/types/auth.types";

/**
 * Authentication Context
 * Provides auth state and methods throughout the application
 * 
 * Security considerations:
 * - User role is always verified server-side
 * - Token expiry is checked on each request
 * - Context provides isLoading to prevent flash of unauthenticated content
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
