import { AuthzErrorCode } from "./authz.errors.js";
import { AuthzError } from "./authz.errors.js";

export function requireSelf(
  context: { userId: string },
  targetUserId: string
) {
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
