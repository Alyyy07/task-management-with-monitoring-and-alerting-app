// authz/task.policy.ts
import { Membership } from "../organization/organization.type.js";

export function taskPolicy(
  context: { userId: string; isSuperAdmin?: boolean },
  membership: Membership,
  attrs: {
    isCreator: boolean;
    isAssignee: boolean;
    isProjectCreator: boolean;
  }
) {
  if (context.isSuperAdmin) return allowAll();
  if (membership.status !== "MEMBER") return denyAll();

  if (membership.role === "OWNER") return allowAll();

  if (membership.role === "ADMIN") {
    return {
      canRead: () => true,
      canCreate: () => true,
      canUpdate: () =>
        attrs.isCreator || attrs.isAssignee || attrs.isProjectCreator,
      canDelete: () => attrs.isProjectCreator,
      canAssign: () => attrs.isProjectCreator,
    };
  }

  return {
    canRead: () => attrs.isCreator || attrs.isAssignee,
    canCreate: () => true,
    canUpdate: () => attrs.isCreator || attrs.isAssignee,
    canDelete: () => attrs.isCreator,
    canAssign: () => false,
  };
}

function allowAll() {
  return {
    canRead: () => true,
    canCreate: () => true,
    canUpdate: () => true,
    canDelete: () => true,
    canAssign: () => true,
  };
}

function denyAll() {
  return {
    canRead: () => false,
    canCreate: () => false,
    canUpdate: () => false,
    canDelete: () => false,
    canAssign: () => false,
  };
}
