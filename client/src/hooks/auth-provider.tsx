import { useState, useEffect, useCallback, ReactNode } from "react";
import { AuthContext } from "./auth-context";
import { secureStorage } from "@/utils/security";
import { getUserInfoApi, type LoginResponse } from "@/apis/auth";
import type { User } from "@/types/auth.types";
import { decodeJWT, isTokenExpired } from "@/types/auth.types";

/**
 * Authentication Provider
 *
 * Security features:
 * - Token stored in sessionStorage (not localStorage) to prevent XSS persistence
 * - User role is ALWAYS fetched from server, never trusted from client
 * - Automatic token expiry checking
 * - Loading state to prevent flash of unauthenticated content
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Check authentication status on mount and token changes
     * CRITICAL: Role is verified server-side, never from local storage
     */
    const checkAuth = useCallback(async (): Promise<boolean> => {
        try {
            const token = secureStorage.getToken();

            if (!token || isTokenExpired(token)) {
                secureStorage.clear();
                setUser(null);
                return false;
            }

            // CRITICAL: Always verify role from server, never trust client storage
            const userInfo = await getUserInfoApi();

            const newUser: User = {
                email: userInfo.email,
                role: userInfo.role, // Role comes from server, not local storage
                token: token,
                tokenExpiry: decodeJWT(token)?.exp,
            };

            setUser(newUser);
            secureStorage.setUser(newUser);

            return true;
        } catch (error) {
            console.error("Auth check failed:", error);
            secureStorage.clear();
            setUser(null);
            return false;
        }
    }, []);

    // Initial auth check on mount
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            await checkAuth();
            setIsLoading(false);
        };

        initAuth();
    }, [checkAuth]);

    /**
     * Login handler
     * Stores token securely and fetches verified user info from server
     */
    const login = useCallback(
        async (response: LoginResponse) => {
            secureStorage.setToken(response.token);

            // CRITICAL: Fetch user info from server to get verified role
            // Never trust role information from login response or client-side
            try {
                const userInfo = await getUserInfoApi();

                const newUser: User = {
                    email: userInfo.email,
                    role: userInfo.role,
                    token: response.token,
                    tokenExpiry: decodeJWT(response.token)?.exp,
                };

                setUser(newUser);
                secureStorage.setUser(newUser);
            } catch {
                // If we can't verify, use email from response but default to USER role
                // This is a fallback - server will still verify on protected routes
                const newUser: User = {
                    email: response.email,
                    role: "USER", // Default to USER, never assume ADMIN
                    token: response.token,
                    tokenExpiry: decodeJWT(response.token)?.exp,
                };

                setUser(newUser);
                secureStorage.setUser(newUser);
            }
        },
        []
    );

    /**
     * Logout handler
     * Clears all stored credentials
     */
    const logout = useCallback(() => {
        secureStorage.clear();
        setUser(null);
    }, []);

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
