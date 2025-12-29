import { AuthzError, AuthzErrorCode } from "../modules/authz/authz.errors.js";
import { OrganizationRepository } from "../modules/organization/organization.type.js";


export async function requireCanAssignTasks(
  actorId: string,
  organizationId: string,
  orgRepo: OrganizationRepository
) {
  const membership = await orgRepo.getMembership(actorId, organizationId);

  if (membership.status === "NOT_FOUND") {
    throw new AuthzError(AuthzErrorCode.NOT_FOUND);
  }

  if (membership.status === "NOT_MEMBER") {
    throw new AuthzError(AuthzErrorCode.NOT_MEMBER);
  }

  if (membership.role === "MEMBER") {
    throw new AuthzError(AuthzErrorCode.INSUFFICIENT_ROLE);
  }
}
