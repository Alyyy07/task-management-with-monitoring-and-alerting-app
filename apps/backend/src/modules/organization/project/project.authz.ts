import { AuthzErrorCode } from "../../authz/authz.errors.js";
import { AuthContext } from "../../authz/authz.type.js";
import { enforce } from "../../authz/enforce.js";
import { ProjectRepository } from "./project.types.js";
import { projectPolicy } from "./project.policy.js";
import { OrganizationAuthz } from "../organization.authz.js";

export class ProjectAuthz {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly orgAuthz: OrganizationAuthz
  ) {}

  requireReadInOrg(context: AuthContext, orgId: string) {
    this.orgAuthz.requireRead(context, orgId);
  }

  async requireReadProject(context: AuthContext, projectId: string) {
    const policy = await this.policy(context, projectId);
    enforce(policy.canRead(), AuthzErrorCode.NOT_MEMBER);
  }

  async requireManageMembers(context: AuthContext, projectId: string) {
    const policy = await this.policy(context, projectId);
    enforce(policy.canManageMembers(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  async requireCreate(context: AuthContext, orgId: string) {
    const membership = await this.orgAuthz.getMembership(context.userId,orgId);
    return projectPolicy(context,membership)
  }

  async requireUpdate(context: AuthContext, projectId: string) {
    const policy = await this.policy(context, projectId);

    enforce(policy.canUpdate(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  async requireDelete(context: AuthContext, projectId: string) {
    const policy = await this.policy(context, projectId);
    enforce(policy.canDelete(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  private async policy(context: AuthContext, projectId: string) {
    const membership = await this.getMembership(context.userId, projectId);
    return projectPolicy(context, membership);
  }

  async getMembership(userId: string, projectId: string) {
    const membership = await this.repo.findMembership(userId, projectId);
    if (!membership) {
      const projectExist = await this.repo.findById(projectId);
      return !!projectExist
        ? ({ status: "NOT_MEMBER" } as const)
        : ({ status: "NOT_FOUND" } as const);
    }

    return { status: "MEMBER", role: membership.role } as const;
  }
}
