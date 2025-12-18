export type Role = "OWNER" | "ADMIN" | "MEMBER";

export const rolePriority: Record<Role, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1
};

export function hasRequiredRole(
  userRole: Role,
  requiredRole: Role
) {
  return rolePriority[userRole] >= rolePriority[requiredRole];
}
