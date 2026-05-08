import { useAuth } from "@/hooks/useAuth";
import type { AppRole } from "@/lib/constants";

/**
 * Returns true if the current user has any of the given roles.
 * `admin` and `techadmin` are treated as super-roles and pass any check.
 */
export function useHasRole(roles: AppRole | AppRole[]): boolean {
  const { roles: userRoles } = useAuth();
  const required = Array.isArray(roles) ? roles : [roles];
  if (userRoles.includes("admin") || userRoles.includes("techadmin" as AppRole)) return true;
  return required.some((r) => userRoles.includes(r));
}

/** Render children only if the current user has any of the given roles. */
export function RoleGuard({
  roles,
  children,
  fallback = null,
}: {
  roles: AppRole | AppRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const allowed = useHasRole(roles);
  return <>{allowed ? children : fallback}</>;
}