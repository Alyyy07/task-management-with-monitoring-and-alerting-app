import { AuthzError, AuthzErrorCode } from "../authz/authz.errors.js";
import { Membership } from "../organization/organization.type.js";

export function requireActiveMembership(
  membership: Membership
): { role: "OWNER" | "ADMIN" | "MEMBER" } {
  if (membership.status === "NOT_FOUND") {
    throw new AuthzError(AuthzErrorCode.NOT_FOUND);
  }

  if (membership.status === "NOT_MEMBER") {
    throw new AuthzError(AuthzErrorCode.NOT_MEMBER);
  }

  return { role: membership.role };
}
