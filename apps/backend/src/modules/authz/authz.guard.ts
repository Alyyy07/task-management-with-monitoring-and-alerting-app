import { AuthzErrorCode, AuthzError } from "./authz.errors.js";

export function requireSelf(context: { userId: string }, targetUserId: string) {
  if (context.userId !== targetUserId) {
    throw new AuthzError(AuthzErrorCode.NOT_OWNER);
  }
}

export type MembershipChecker = (
  userId: string,
  orgId: string
) => Promise<boolean>;

export async function requireOrgMember(
  context: { userId: string },
  orgId: string,
  isMember: MembershipChecker
) {
  const allowed = await isMember(context.userId, orgId);

  if (!allowed) {
    throw new AuthzError(AuthzErrorCode.NOT_MEMBER);
  }
}

export type TaskOwnershipChecker = (
  userId: string,
  taskId: string
) => Promise<"OWNER" | "NOT_OWNER" | "NOT_FOUND">;

export async function requireTaskOwner(
  context: { userId: string },
  taskId: string,
  check: TaskOwnershipChecker
) {
  const result = await check(context.userId, taskId);

  if (result === "NOT_FOUND") {
    throw new AuthzError(AuthzErrorCode.NOT_FOUND);
  }

  if (result === "NOT_OWNER") {
    throw new AuthzError(AuthzErrorCode.NOT_FOUND);
  }
}
