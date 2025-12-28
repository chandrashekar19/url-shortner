import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./protected-route";
import { useAuth } from "@/hooks/use-auth";

// Mock useAuth
vi.mock("@/hooks/use-auth", () => ({
    useAuth: vi.fn(),
}));

describe("ProtectedRoute Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should show loading state while auth is loading", () => {
        (useAuth as any).mockReturnValue({
            isLoading: true,
            isAuthenticated: false,
            user: null,
        });

        render(
            <MemoryRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText("Verifying authentication...")).toBeInTheDocument();
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("should redirect to login if not authenticated", () => {
        (useAuth as any).mockReturnValue({
            isLoading: false,
            isAuthenticated: false,
            user: null,
        });

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Login Page")).toBeInTheDocument();
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("should render children if authenticated", () => {
        (useAuth as any).mockReturnValue({
            isLoading: false,
            isAuthenticated: true,
            user: { role: "USER" },
        });

        render(
            <MemoryRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("should redirect to home if adminOnly is true and user is not admin", () => {
        (useAuth as any).mockReturnValue({
            isLoading: false,
            isAuthenticated: true,
            user: { role: "USER" },
        });

        render(
            <MemoryRouter initialEntries={["/admin"]}>
                <Routes>
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute adminOnly>
                                <div>Admin Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/home" element={<div>Home Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Home Page")).toBeInTheDocument();
        expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
    });

    it("should render children if adminOnly is true and user is admin", () => {
        (useAuth as any).mockReturnValue({
            isLoading: false,
            isAuthenticated: true,
            user: { role: "ADMIN" },
        });

        render(
            <MemoryRouter>
                <ProtectedRoute adminOnly>
                    <div>Admin Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText("Admin Content")).toBeInTheDocument();
    });
});
