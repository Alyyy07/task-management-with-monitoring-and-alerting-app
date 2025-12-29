import { AuthzError, AuthzErrorCode } from "../authz/authz.errors.js";
import { OrganizationRepository } from "../organization/organization.type.js";


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

export function requirePolicy(
  allowed: boolean,
  error: AuthzErrorCode
) {
  if (!allowed) {
    throw new AuthzError(error);
  }
}
