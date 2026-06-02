import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole } from "@/lib/constants";

export function ProtectedRoute({
  children,
  requiredRoles,
}: {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
}) {
  const { session, loading, roles } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const isSuper = roles.includes("admin") || roles.includes("techadmin" as AppRole);
    const allowed = isSuper || requiredRoles.some((r) => roles.includes(r));
    if (!allowed) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
