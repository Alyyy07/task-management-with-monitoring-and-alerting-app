import { Membership } from "./organization.type.js";

export interface OrganizationPolicy {
  canRead(): boolean;
  canUpdate(): boolean;
  canDelete(): boolean;
  canManageMembers(): boolean;
}

export function organizationPolicy(
  context: { userId: string; isSuperAdmin?: boolean },
  membership: Membership | null
) {
  // Super Admin bypass
  if (context.isSuperAdmin) {
    return allowAll();
  }

  if (!membership || membership.status !== "MEMBER") {
    return denyAll();
  }

  switch (membership.role) {
    case "OWNER":
      return allowAll();

    case "ADMIN":
      return {
        canRead: () => true,
        canUpdate: () => true,
        canDelete: () => false,
        canManageMembers: () => false,
      };

    case "MEMBER":
      return {
        canRead: () => true,
        canUpdate: () => false,
        canDelete: () => false,
        canManageMembers: () => false,
      };
  }
}

function allowAll() {
  return {
    canRead: () => true,
    canUpdate: () => true,
    canDelete: () => true,
    canManageMembers: () => true,
  };
}

function denyAll() {
  return {
    canRead: () => false,
    canUpdate: () => false,
    canDelete: () => false,
    canManageMembers: () => false,
  };
}
