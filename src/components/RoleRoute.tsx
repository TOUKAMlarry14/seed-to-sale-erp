import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole } from "@/lib/constants";

/**
 * Route guard: redirects to "/" if the current user does not have any of the
 * given roles. `admin` and `techadmin` always pass. Pass an empty roles array
 * to restrict the route to admin/techadmin only.
 */
export function RoleRoute({
  roles,
  children,
}: {
  roles: AppRole[];
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { roles: userRoles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  const isSuper =
    userRoles.includes("admin") || userRoles.includes("techadmin" as AppRole);
  const allowed = isSuper || roles.some((r) => userRoles.includes(r));

  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
}