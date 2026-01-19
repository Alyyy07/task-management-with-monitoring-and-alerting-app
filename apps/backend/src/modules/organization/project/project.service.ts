import { AuthContext } from "../../../libs/authz/authz.type.js";
import { ProjectRepository, ProjectStatus } from "./project.types.js";
import { ProjectAuthz } from "./project.authz.js";
import { DbError, DbErrorCode } from "../../../libs/db.errors.js";

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

  async getBySlug(context: AuthContext, orgId: string, slug: string) {
    await this.authz.requireReadInOrg(context, orgId);
    const project = await this.repo.findBySlug(orgId, slug);
    if (project) {
      await this.authz.requireReadProject(context, project.id);
    }
    return project;
  }

  async create(
    context: AuthContext,
    data: {
      name: string;
      slug?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    },
    orgId: string
  ) {
    await this.authz.requireCreate(context, orgId);

    const slug = data.slug || this.generateSlug(data.name);

    // Check if slug already exists in org
    const existing = await this.repo.findBySlug(orgId, slug);
    if (existing) {
      throw new DbError(
        DbErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
        "slug",
        `Project slug '${slug}' already exists in this organization`
      );
    }

    const project = await this.repo.create({
      ...data,
      slug,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      createdById: context.userId,
      organizationId: orgId,
    });

    await this.repo.addMember(context.userId, project.id, "OWNER");

    await this.repo.createActivity({
      userId: context.userId,
      action: "PROJECT_CREATED",
      projectId: project.id,
      organizationId: orgId,
      entityId: project.id,
      entityType: "PROJECT",
      metadata: { name: project.name, slug: project.slug },
    });

    return project;
  }

  async update(
    context: AuthContext,
    projectId: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      status?: ProjectStatus;
      startDate?: string;
      endDate?: string;
    }
  ) {
    await this.authz.requireUpdate(context, projectId);
    const project = await this.repo.update(projectId, {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });

    await this.repo.createActivity({
      userId: context.userId,
      action: "PROJECT_UPDATED",
      projectId: project.id,
      organizationId: project.organizationId,
      entityId: project.id,
      entityType: "PROJECT",
      metadata: { changes: data },
    });

    return project;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async delete(
    context: AuthContext,
    projectId: string,
    cascade: boolean = false
  ) {
    await this.authz.requireDelete(context, projectId);

    const project = await this.repo.findById(projectId);
    if (!project)
      throw new DbError(
        DbErrorCode.RECORD_NOT_FOUND,
        "projectId",
        `Project not found`
      );

    if (!cascade) {
      const taskCount = await this.repo.countTasks(projectId);
      if (taskCount > 0) {
        throw new DbError(
          DbErrorCode.DEPENDENCY_CONFLICT,
          "projectId",
          `Project '${projectId}' cannot be deleted because it contains ${taskCount} task(s). Use cascade delete if you want to remove everything.`
        );
      }
    }

    await this.repo.createActivity({
      userId: context.userId,
      action: "PROJECT_DELETED",
      projectId: projectId,
      organizationId: project.organizationId,
      entityId: projectId,
      entityType: "PROJECT",
      metadata: { name: project.name, cascade },
    });

    await this.repo.delete(projectId);
  }

  async listMembers(context: AuthContext, projectId: string) {
    await this.authz.requireReadProject(context, projectId);
    return this.repo.listMembers(projectId);
  }

  async addMember(
    context: AuthContext,
    projectId: string,
    userId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    await this.authz.requireManageMembers(context, projectId);

    const project = await this.validateProjectExists(projectId);
    await this.validateUserExists(userId);

    // Validate if the user is a member of the organization
    const orgMembership = await this.repo.getOrgMembership(
      userId,
      project.organizationId
    );
    if (!orgMembership) {
      throw new DbError(
        DbErrorCode.INVALID_REFERENCE,
        "userId",
        `User '${userId}' is not a member of the organization this project belongs to`
      );
    }

    // Check if user is already a member
    const existingMembership = await this.repo.findMembership(
      userId,
      projectId
    );
    if (existingMembership) {
      throw new DbError(
        DbErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
        "userId",
        `User '${userId}' is already a member of this project`
      );
    }

    return this.repo.addMember(userId, projectId, role);
  }

  async removeMember(context: AuthContext, projectId: string, userId: string) {
    await this.authz.requireManageMembers(context, projectId);

    await this.validateProjectExists(projectId);
    await this.validateMembershipExists(userId, projectId);

    await this.repo.removeMember(userId, projectId);
  }

  async changeMemberRole(
    context: AuthContext,
    projectId: string,
    userId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    await this.authz.requireManageMembers(context, projectId);

    await this.validateProjectExists(projectId);
    await this.validateMembershipExists(userId, projectId);

    await this.repo.changeMemberRole(userId, projectId, role);
  }

  // Private validation helpers
  private async validateProjectExists(projectId: string) {
    const project = await this.repo.findById(projectId);
    if (!project) {
      throw new DbError(
        DbErrorCode.RECORD_NOT_FOUND,
        "projectId",
        `Project with ID '${projectId}' not found`
      );
    }
    return project;
  }

  private async validateUserExists(userId: string): Promise<void> {
    const userExists = await this.repo.userExists(userId);
    if (!userExists) {
      throw new DbError(
        DbErrorCode.INVALID_REFERENCE,
        "userId",
        `User with ID '${userId}' not found`
      );
    }
  }

  private async validateMembershipExists(
    userId: string,
    projectId: string
  ): Promise<void> {
    const membership = await this.repo.findMembership(userId, projectId);
    if (!membership) {
      throw new DbError(
        DbErrorCode.RECORD_NOT_FOUND,
        "userId",
        `User '${userId}' is not a member of this project`
      );
    }
  }
}
