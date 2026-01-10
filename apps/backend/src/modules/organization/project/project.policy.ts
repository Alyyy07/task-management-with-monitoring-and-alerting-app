// authz/project.policy.ts
import { Membership } from "../organization.type.js";

export function projectPolicy(
  context: { userId: string; isSuperAdmin?: boolean },
  membership: Membership | null,
  isCreator: boolean
) {
  if (context.isSuperAdmin) {
    return allowAll();
  }

  if (!membership) {
    return denyAll();
  }

  if (membership.status !== "MEMBER") {
    return denyAll();
  }

  if (membership.role === "OWNER") {
    return allowAll();
  }

  if (membership.role === "ADMIN") {
    return {
      canRead: () => true,
      canCreate: () => true,
      canUpdate: () => isCreator,
      canDelete: () => false,
      canManageMembers: () => true,
    };
  }

  return {
    canRead: () => true,
    canCreate: () => false,
    canUpdate: () => false,
    canDelete: () => false,
    canManageMembers: () => false,
  };
}

function allowAll() {
  return {
    canRead: () => true,
    canCreate: () => true,
    canUpdate: () => true,
    canDelete: () => true,
    canManageMembers: () => true,

  };
}

function denyAll() {
  return {
    canRead: () => false,
    canCreate: () => false,
    canUpdate: () => false,
    canDelete: () => false,
    canManageMembers: () => false,
  };
}
