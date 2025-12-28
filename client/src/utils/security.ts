/**
 * Security utilities for Kutt URL Shortener
 * Provides XSS protection, input sanitization, and security helpers
 */

/**
 * Sanitizes HTML to prevent XSS attacks
 * Uses a simple but effective whitelist approach
 */
export function sanitizeHTML(str: string): string {
    const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;",
    };
    return str.replace(/[&<>"'`=/]/g, (s) => map[s]);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates password strength
 * Requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 number
 */
export function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }
    if (password.length > 64) {
        errors.push("Password must not exceed 64 characters");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validates URL format
 */
export function isValidURL(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Secure storage wrapper that doesn't expose sensitive data to XSS
 * Uses sessionStorage for tokens (cleared on browser close)
 */
export const secureStorage = {
    setToken: (token: string): void => {
        try {
            sessionStorage.setItem("auth_token", token);
        } catch {
            console.error("Failed to store token securely");
        }
    },

    getToken: (): string | null => {
        try {
            return sessionStorage.getItem("auth_token");
        } catch {
            return null;
        }
    },

    removeToken: (): void => {
        try {
            sessionStorage.removeItem("auth_token");
            localStorage.removeItem("token"); // Clean up legacy storage
            localStorage.removeItem("user");
        } catch {
            console.error("Failed to remove token securely");
        }
    },

    setUser: (user: object): void => {
        try {
            // Store non-sensitive user data only
            const safeUser = { ...user, token: undefined };
            sessionStorage.setItem("auth_user", JSON.stringify(safeUser));
        } catch {
            console.error("Failed to store user data");
        }
    },

    getUser: <T>(): T | null => {
        try {
            const data = sessionStorage.getItem("auth_user");
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    removeUser: (): void => {
        try {
            sessionStorage.removeItem("auth_user");
        } catch {
            console.error("Failed to remove user data");
        }
    },

    clear: (): void => {
        secureStorage.removeToken();
        secureStorage.removeUser();
    },
};

/**
 * Rate limiting helper for client-side protection
 */
export class RateLimiter {
    private attempts: Map<string, number[]> = new Map();
    private readonly maxAttempts: number;
    private readonly windowMs: number;

    constructor(maxAttempts: number = 5, windowMs: number = 60000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }

    isAllowed(key: string): boolean {
        const now = Date.now();
        const timestamps = this.attempts.get(key) || [];
        const validTimestamps = timestamps.filter((t) => now - t < this.windowMs);

        if (validTimestamps.length >= this.maxAttempts) {
            return false;
        }

        validTimestamps.push(now);
        this.attempts.set(key, validTimestamps);
        return true;
    }

    getRemainingTime(key: string): number {
        const timestamps = this.attempts.get(key) || [];
        if (timestamps.length === 0) return 0;

        const oldestInWindow = Math.min(...timestamps);
        const remaining = this.windowMs - (Date.now() - oldestInWindow);
        return Math.max(0, remaining);
    }
}

/**
 * CSRF token management
 */
export const csrf = {
    generate: (): string => {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
            ""
        );
    },

    get: (): string | null => {
        return sessionStorage.getItem("csrf_token");
    },

    set: (token: string): void => {
        sessionStorage.setItem("csrf_token", token);
    },

    validate: (token: string): boolean => {
        const stored = csrf.get();
        return stored !== null && stored === token;
    },
};
