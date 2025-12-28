import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Header from "./header";
import { useAuth } from "@/hooks/use-auth";

// Mock useAuth
vi.mock("@/hooks/use-auth", () => ({
    useAuth: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("Header Component", () => {
    const mockLogout = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render correctly for a standard user", () => {
        (useAuth as any).mockReturnValue({
            user: { email: "user@test.com", role: "USER" },
            logout: mockLogout,
        });

        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );

        expect(screen.getByText("Kutt")).toBeInTheDocument();
        expect(screen.queryByText("Admin")).not.toBeInTheDocument();
        expect(screen.getByText("Log out")).toBeInTheDocument();
    });

    it("should show Admin button for admin users", () => {
        (useAuth as any).mockReturnValue({
            user: { email: "admin@test.com", role: "ADMIN" },
            logout: mockLogout,
        });

        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );

        expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    it("should navigate to home when logo is clicked", () => {
        (useAuth as any).mockReturnValue({
            user: { email: "user@test.com", role: "USER" },
            logout: mockLogout,
        });

        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText("Kutt"));
        expect(mockNavigate).toHaveBeenCalledWith("/home");
    });

    it("should call logout and navigate to login when logout button is clicked", () => {
        (useAuth as any).mockReturnValue({
            user: { email: "user@test.com", role: "USER" },
            logout: mockLogout,
        });

        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText("Log out"));
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
});
