import { AuthzErrorCode } from "../authz/authz.errors.js";
import { AuthContext } from "../authz/authz.type.js";
import { enforce } from "../authz/enforce.js";
import { OrganizationRepository } from "../organization/organization.type.js";
import { ProjectRepository } from "../project/project.types.js";
import { projectPolicy } from "./project.policy.js";
export class ProjectAuthz {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly projectRepo: ProjectRepository
  ) {}

  async requireCreate(context: AuthContext, orgId: string) {
    const membership = await this.orgRepo.getMembership(
      context.userId,
      orgId
    );

    if (!membership || membership.status !== "MEMBER") {
      throw new Error("NOT_MEMBER");
    }

    const policy = projectPolicy(context, membership, false);

    enforce(
      policy.canCreate(),
      AuthzErrorCode.INSUFFICIENT_ROLE
    );
  }

  async requireUpdate(context: AuthContext, projectId: string) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error("PROJECT_NOT_FOUND");

    const membership = await this.orgRepo.getMembership(
      context.userId,
      project.organizationId
    );

    const creator =
      (await this.projectRepo.isCreator(projectId, context.userId)) ===
      "CREATOR";

    if (!membership || membership.status !== "MEMBER") {
      throw new Error("NOT_MEMBER");
    }

    const policy = projectPolicy(context, membership, creator);

    enforce(
      policy.canUpdate(),
      AuthzErrorCode.INSUFFICIENT_ROLE
    );
  }

  async requireDelete(context: AuthContext, projectId: string) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error("PROJECT_NOT_FOUND");

    const membership = await this.orgRepo.getMembership(
      context.userId,
      project.organizationId
    );

    if (!membership || membership.status !== "MEMBER") {
      throw new Error("NOT_MEMBER");
    }

    const policy = projectPolicy(context, membership, false);

    enforce(
      policy.canDelete(),
      AuthzErrorCode.INSUFFICIENT_ROLE
    );
  }
}
