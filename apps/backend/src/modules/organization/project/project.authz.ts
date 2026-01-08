import { AuthzErrorCode } from "../../authz/authz.errors.js";
import { AuthContext } from "../../authz/authz.type.js";
import { enforce } from "../../authz/enforce.js";
import { OrganizationRepository } from "../organization.type.js";
import { ProjectRepository, Project } from "./project.types.js";
import { projectPolicy } from "./project.policy.js";

export class ProjectAuthz {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly projectRepo: ProjectRepository
  ) {}

  async requireReadInOrg(context: AuthContext, orgId: string) {
    const membership = await this.orgRepo.getMembership(context.userId, orgId);

    const policy = projectPolicy(context, membership, false);

    enforce(policy.canRead(), AuthzErrorCode.NOT_MEMBER);
  }

  async requireReadProject(context: AuthContext, orgId: string) {
    const membership = await this.orgRepo.getMembership(
      context.userId,
      orgId
    );

    const policy = projectPolicy(context, membership, false);

    enforce(policy.canRead(), AuthzErrorCode.NOT_MEMBER);
  }

  async requireCreate(context: AuthContext, orgId: string) {
    const policy = await this.policy(context, orgId);
    enforce(policy.canCreate(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  async requireUpdate(context: AuthContext, projectId: string, orgId: string) {
    const membership = await this.orgRepo.getMembership(
      context.userId,
      orgId
    );

    const isCreator =
      (await this.projectRepo.isCreator(projectId, context.userId)) ===
      "CREATOR";

    const policy = projectPolicy(context, membership, isCreator);

    enforce(policy.canUpdate(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  async requireDelete(context: AuthContext, orgId: string) {
    const membership = await this.orgRepo.getMembership(
      context.userId,
      orgId
    );

    const policy = projectPolicy(context, membership, false);

    enforce(policy.canDelete(), AuthzErrorCode.INSUFFICIENT_ROLE);
  }

  private async policy(context: AuthContext, orgId: string) {
    const membership = await this.orgRepo.getMembership(context.userId, orgId);
    return projectPolicy(context, membership, false);
  }
}
