import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { decodeJWT, isTokenExpired } from "./auth.types";

describe("Auth Types & Helpers", () => {
    // Helper to create a fake JWT token
    const createMockToken = (payload: object) => {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payloadStr = btoa(JSON.stringify(payload));
        const signature = "signature";
        return `${header}.${payloadStr}.${signature}`;
    };

    describe("decodeJWT", () => {
        it("should correctly decode a valid JWT payload", () => {
            const payload = { sub: 123, exp: 9999999999 };
            const token = createMockToken(payload);
            const decoded = decodeJWT(token);

            expect(decoded).toMatchObject(payload);
        });

        it("should return null for invalid token format", () => {
            expect(decodeJWT("invalid-token")).toBeNull();
            expect(decodeJWT("one.two")).toBeNull();
        });

        it("should return null for non-JSON payload", () => {
            const token = "header.bm90LWpzb24=.signature"; // btoa("not-json")
            expect(decodeJWT(token)).toBeNull();
        });
    });

    describe("isTokenExpired", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("should return false for token with future expiry", () => {
            // Set current time to 1000
            vi.setSystemTime(1000 * 1000);

            const payload = { exp: 2000 }; // Expires at 2000s
            const token = createMockToken(payload);

            expect(isTokenExpired(token)).toBe(false);
        });

        it("should return true for expired token", () => {
            vi.setSystemTime(5000 * 1000);

            const payload = { exp: 2000 };
            const token = createMockToken(payload);

            expect(isTokenExpired(token)).toBe(true);
        });

        it("should return true for token within 60s buffer", () => {
            // Current time is 1950s, token expires at 2000s
            // (2000 * 1000) - 60000 = 1940s
            // 1950s >= 1940s -> true
            vi.setSystemTime(1950 * 1000);

            const payload = { exp: 2000 };
            const token = createMockToken(payload);

            expect(isTokenExpired(token)).toBe(true);
        });

        it("should return true for invalid token", () => {
            expect(isTokenExpired("invalid")).toBe(true);
        });
    });
});
