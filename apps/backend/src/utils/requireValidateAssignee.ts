import { AuthzError, AuthzErrorCode } from "../modules/authz/authz.errors.js";
import { OrganizationRepository } from "../modules/organization/organization.type.js";

export async function requireUserIsOrgMember(
  userId: string,
  organizationId: string,
  orgRepo: OrganizationRepository
) {
  const membership = await orgRepo.getMembership(userId, organizationId);

  if (membership.status !== "MEMBER") {
    throw new AuthzError(AuthzErrorCode.INVALID_ASSIGNEE);
  }
}
