import { AuthContext } from "../authz/authz.type.js";
import { ProjectAuthz } from "./project.authz.js";
import { ProjectRepository } from "./project.types.js";

export class ProjectService {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly authz: ProjectAuthz
  ) {}

  async list(context: AuthContext, orgId: string) {
    await this.authz.requireCreate(context, orgId);
    return this.repo.findByOrganization(orgId);
  }

  async create(context: AuthContext, data:{ name: string; organizationId: string }) {
    await this.authz.requireCreate(context, data.organizationId);

    return this.repo.create({
      ...data,
      createdBy: context.userId,
    });
  }

  async update(context: AuthContext, projectId: string, data:{ name?: string }) {
    await this.authz.requireUpdate(context, projectId);
    return this.repo.update(projectId, data);
  }

  async delete(context: AuthContext, projectId: string) {
    await this.authz.requireDelete(context, projectId);
    await this.repo.delete(projectId);
  }
}
