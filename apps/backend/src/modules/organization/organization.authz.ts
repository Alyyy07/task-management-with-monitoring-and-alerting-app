import { AuthzErrorCode } from "../authz/authz.errors.js";
import { AuthContext } from "../authz/authz.type.js";
import { enforce } from "../authz/enforce.js";
import { organizationPolicy } from "./organization.policy.js";
import { OrganizationRepository } from "./organization.type.js";

export class OrganizationAuthz {
  constructor(private readonly repo: OrganizationRepository) {}

  async requireRead(context: AuthContext, orgId: string) {
    const policy = await this.policy(context, orgId);
    enforce(policy.canRead(), AuthzErrorCode.NOT_MEMBER);
  }

  async requireUpdate(context: AuthContext, orgId: string) {
    const policy = await this.policy(context, orgId);
    enforce(policy.canUpdate(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  async requireDelete(context: AuthContext, orgId: string) {
    const policy = await this.policy(context, orgId);
    enforce(policy.canDelete(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  async requireManageMembers(context: AuthContext, orgId: string) {
    const policy = await this.policy(context, orgId);
    enforce(policy.canManageMembers(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  private async policy(context: AuthContext, orgId: string) {
    const membership = await this.repo.getMembership(context.userId, orgId);
    return organizationPolicy(context, membership);
  }
}
