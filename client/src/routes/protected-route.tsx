import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth-proivder";

interface ProtectedRouteProps {
  children: ReactElement;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly }: ProtectedRouteProps) {
  const { user } = useAuth();
  

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.role !== "ADMIN") {
    return <Navigate to="/home" replace />;
  }

  return children;
}
