import { AuthzErrorCode } from "../../../libs/authz/authz.errors.js";
import { AuthContext } from "../../../libs/authz/authz.type.js";
import { enforce } from "../../../libs/authz/enforce.js";
import { ProjectRepository } from "./project.types.js";
import { projectPolicy } from "./project.policy.js";
import { OrganizationAuthz } from "../organization.authz.js";

export class ProjectAuthz {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly orgAuthz: OrganizationAuthz
  ) {}

  async requireReadInOrg(context: AuthContext, orgId: string) {
    return this.orgAuthz.requireRead(context, orgId);
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
    const membership = await this.orgAuthz.getMembership(context.userId, orgId);
    const policy = projectPolicy(context, membership);
    enforce(policy.canCreate(), AuthzErrorCode.INSUFFICIENT_ROLE);
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
    // First, get the project to find its organization
    const project = await this.repo.findById(projectId);
    if (!project) {
      return projectPolicy(context, { status: "NOT_FOUND" } as const);
    }

    // Check organization-level permissions using OrganizationAuthz
    const orgPolicy = await this.orgAuthz.policy(
      context,
      project.organizationId
    );

    // If user cannot even read the organization, deny all project access
    if (!orgPolicy.canRead()) {
      return projectPolicy(context, { status: "NOT_MEMBER" } as const);
    }

    // check project-specific membership
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
