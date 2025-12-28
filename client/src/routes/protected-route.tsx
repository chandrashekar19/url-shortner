import { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: ReactElement;
  adminOnly?: boolean;
}

/**
 * Protected Route Component
 *
 * Security features:
 * - Prevents access to protected routes while auth is loading
 * - Redirects to login with return URL for seamless user experience
 * - Verifies admin role for admin-only routes
 * - Shows loading state to prevent flash of protected content
 */
export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  // This prevents flash of login page for authenticated users
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // Preserve the intended destination for redirect after login
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Check admin access for admin-only routes
  if (adminOnly && user?.role !== "ADMIN") {
    return <Navigate to="/home" replace />;
  }

  return children;
}
