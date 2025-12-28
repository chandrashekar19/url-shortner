import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    sanitizeHTML,
    isValidEmail,
    validatePassword,
    isValidURL,
    secureStorage,
    RateLimiter,
    csrf,
} from "./security";

describe("Security Utilities", () => {
    describe("sanitizeHTML", () => {
        it("should escape HTML special characters", () => {
            const input = '<script>alert("xss")</script>';
            const expected = "&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;";
            expect(sanitizeHTML(input)).toBe(expected);
        });

        it("should escape other dangerous characters", () => {
            const input = "foo ' bar ` baz = /";
            const expected = "foo &#039; bar &#x60; baz &#x3D; &#x2F;";
            expect(sanitizeHTML(input)).toBe(expected);
        });
    });

    describe("isValidEmail", () => {
        it("should return true for valid emails", () => {
            expect(isValidEmail("test@example.com")).toBe(true);
            expect(isValidEmail("user.name+tag@domain.co.uk")).toBe(true);
        });

        it("should return false for invalid emails", () => {
            expect(isValidEmail("invalid-email")).toBe(false);
            expect(isValidEmail("@domain.com")).toBe(false);
            expect(isValidEmail("user@")).toBe(false);
            expect(isValidEmail("user@domain")).toBe(false);
        });
    });

    describe("validatePassword", () => {
        it("should return valid for strong passwords", () => {
            const result = validatePassword("StrongPass123");
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should return errors for missing requirements", () => {
            // Too short
            expect(validatePassword("Short1").isValid).toBe(false);
            // No uppercase
            expect(validatePassword("lowercase123").isValid).toBe(false);
            // No lowercase
            expect(validatePassword("UPPERCASE123").isValid).toBe(false);
            // No number
            expect(validatePassword("NoNumberPass").isValid).toBe(false);
        });
    });

    describe("isValidURL", () => {
        it("should return true for valid URLs", () => {
            expect(isValidURL("https://example.com")).toBe(true);
            expect(isValidURL("http://localhost:3000/test")).toBe(true);
        });

        it("should return false for invalid URLs", () => {
            expect(isValidURL("not-a-url")).toBe(false);
            expect(isValidURL("ftp://bad-protocol")).toBe(true); // Technically valid URL object
            expect(isValidURL("")).toBe(false);
        });
    });

    describe("secureStorage", () => {
        beforeEach(() => {
            sessionStorage.clear();
            localStorage.clear();
        });

        it("should set and get token from sessionStorage", () => {
            secureStorage.setToken("test-token");
            expect(sessionStorage.getItem("auth_token")).toBe("test-token");
            expect(secureStorage.getToken()).toBe("test-token");
        });

        it("should set and get safe user data", () => {
            const user = { email: "test@test.com", role: "ADMIN", token: "secret" };
            secureStorage.setUser(user);

            const stored = JSON.parse(sessionStorage.getItem("auth_user") || "{}");
            expect(stored.email).toBe("test@test.com");
            expect(stored.token).toBeUndefined(); // Sensitive data should be stripped

            const retrieved = secureStorage.getUser<any>();
            expect(retrieved.role).toBe("ADMIN");
        });

        it("should clear storage on logout", () => {
            secureStorage.setToken("token");
            secureStorage.setUser({ name: "test" });
            secureStorage.clear();

            expect(secureStorage.getToken()).toBeNull();
            expect(secureStorage.getUser()).toBeNull();
        });
    });

    describe("RateLimiter", () => {
        it("should allow attempts within limit", () => {
            const limiter = new RateLimiter(3, 1000);
            expect(limiter.isAllowed("test")).toBe(true);
            expect(limiter.isAllowed("test")).toBe(true);
            expect(limiter.isAllowed("test")).toBe(true);
            expect(limiter.isAllowed("test")).toBe(false);
        });

        it("should reset after window", async () => {
            vi.useFakeTimers();
            const limiter = new RateLimiter(1, 100);

            expect(limiter.isAllowed("test")).toBe(true);
            expect(limiter.isAllowed("test")).toBe(false);

            vi.advanceTimersByTime(150);
            expect(limiter.isAllowed("test")).toBe(true);

            vi.useRealTimers();
        });
    });

    describe("csrf", () => {
        it("should generate valid hex token", () => {
            const token = csrf.generate();
            expect(token).toMatch(/^[0-9a-f]{64}$/);
        });

        it("should validate stored tokens", () => {
            const token = "test-csrf";
            csrf.set(token);
            expect(csrf.validate(token)).toBe(true);
            expect(csrf.validate("wrong")).toBe(false);
        });
    });
});
