import type { AuthUser } from "./auth";

export function hasRole(user: AuthUser | null, roles: string | string[]) {
  if (!user) return false;
  const list = Array.isArray(roles) ? roles : [roles];
  return list.includes(user.role);
}

