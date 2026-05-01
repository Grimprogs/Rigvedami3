import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Role } from "@/data/seed";

export function ProtectedRoute({ children, role }: { children: ReactNode; role: Role }) {
  const { user, authLoading } = useApp();
  const location = useLocation();

  // Show nothing while Supabase session is loading (avoids flash redirect)
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not logged in → redirect to the appropriate login page
  if (!user) {
    return (
      <Navigate
        to={role === "admin" ? "/login/admin" : "/login/employee"}
        state={{ from: location }}
        replace
      />
    );
  }

  // Wrong role → redirect to their own dashboard
  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/me"} replace />;
  }

  return <>{children}</>;
}
