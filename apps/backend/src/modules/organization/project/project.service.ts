import { AuthContext } from "../../authz/authz.type.js";
import { ProjectAuthz } from "./project.authz.js";
import { ProjectRepository } from "./project.types.js";

export class ProjectService {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly authz: ProjectAuthz
  ) {}

  async list(context: AuthContext, orgId: string) {
    await this.authz.requireReadInOrg(context, orgId);
    return this.repo.findByOrganization(orgId);
  }

  async get(context: AuthContext, projectId: string, orgId: string) {
    await this.authz.requireReadProject(context, orgId);
    return this.repo.findById(projectId);
  }

  async create(context: AuthContext, data: { name: string }, orgId: string) {
    await this.authz.requireCreate(context, orgId);

    return this.repo.create({
      ...data,
      createdById: context.userId,
      organizationId: orgId,
    });
  }

  async update(
    context: AuthContext,
    projectId: string,
    orgId: string,
    data: { name?: string }
  ) {
    await this.authz.requireUpdate(context, projectId, orgId);
    return this.repo.update(projectId, data);
  }

  async delete(context: AuthContext, projectId: string, orgId: string) {
    await this.authz.requireDelete(context, orgId);
    await this.repo.delete(projectId);
  }
}
