/**
 * Authentication types for Kutt URL Shortener
 * Centralized type definitions for security and consistency
 */

export type UserRole = "USER" | "ADMIN";

export interface User {
    email: string;
    role: UserRole;
    token: string;
    tokenExpiry?: number;
}

export interface AuthResponse {
    message: string;
    token: string;
    email: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
}

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (response: AuthResponse) => void;
    logout: () => void;
    checkAuth: () => Promise<boolean>;
}

export interface AuthError {
    success: false;
    error: string;
}

export interface ApiError {
    response?: {
        data?: {
            error?: string;
            message?: string;
        };
        status?: number;
    };
    message?: string;
}

/**
 * JWT Payload structure from server
 */
export interface JWTPayload {
    iss: string;
    sub: number;
    iat: number;
    exp: number;
}

/**
 * Decodes a JWT token without verification (for client-side expiry check only)
 * NEVER use this for security validation - server handles that
 */
export function decodeJWT(token: string): JWTPayload | null {
    try {
        const base64Payload = token.split(".")[1];
        const payload = JSON.parse(atob(base64Payload));
        return payload as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Checks if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;
    // Add 60 second buffer for clock skew
    return Date.now() >= (payload.exp * 1000) - 60000;
}
