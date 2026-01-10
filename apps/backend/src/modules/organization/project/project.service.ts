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

  async get(context: AuthContext, projectId: string) {
    await this.authz.requireReadProject(context, projectId);
    return this.repo.findById(projectId);
  }

  async create(context: AuthContext, data: { name: string }, orgId: string) {
    await this.authz.requireCreate(context, orgId);

    const project = await this.repo.create({
      ...data,
      createdById: context.userId,
      organizationId: orgId,
    });

    this.repo.addMember(context.userId, orgId, project.id, "OWNER");

    return project;
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

  async listMembers(context: AuthContext, projectId: string) {
    await this.authz.requireReadProject(context, projectId);
    return this.repo.listMembers(projectId);
  }

  async addMember(
    context: AuthContext,
    orgId: string,
    projectId: string,
    userId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    await this.authz.requireManageMembers(context, projectId);
    return this.repo.addMember(userId, orgId, projectId, role);
  }

  async removeMember(
    context: AuthContext,
    orgId: string,
    projectId: string,
    userId: string
  ) {
    await this.authz.requireManageMembers(context, projectId);
    await this.repo.removeMember(userId, orgId, projectId);
  }

  async changeMemberRole(
    context: AuthContext,
    orgId: string,
    projectId: string,
    userId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    await this.authz.requireManageMembers(context, projectId);
    await this.repo.changeMemberRole(userId, orgId, projectId, role);
  }
}
