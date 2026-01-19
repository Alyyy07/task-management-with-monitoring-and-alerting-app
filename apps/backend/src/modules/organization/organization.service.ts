import { prisma } from "../../libs/prisma.js";
import { AuthContext } from "../../libs/authz/authz.type.js";
import { OrganizationAuthz } from "./organization.authz.js";
import { OrganizationRepository } from "./organization.type.js";
import { DbError, DbErrorCode } from "../../libs/db.errors.js";

export class OrganizationService {
  constructor(
    private readonly repo: OrganizationRepository,
    private readonly authz: OrganizationAuthz
  ) {}

  async listOrg(context: AuthContext) {
    if (context.isSuperAdmin) return await this.repo.listAllOrg();
    return await this.repo.listOrgByUser(context.userId);
  }

  async create(
    context: AuthContext,
    data: {
      name: string;
      slug?: string;
      description?: string;
      logoUrl?: string;
    }
  ) {
    const slug = data.slug || this.generateSlug(data.name);

    // Check if slug exists
    const existing = await this.repo.findBySlug(slug);
    if (existing) {
      throw new DbError(
        DbErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
        "slug",
        `Organization slug '${slug}' already exists`
      );
    }

    const org = await this.repo.create({
      ...data,
      slug,
      createdById: context.userId,
    });

    await this.repo.addMember(context.userId, org.id, "OWNER");

    await this.repo.createActivity({
      userId: context.userId,
      action: "ORG_CREATED",
      organizationId: org.id,
      entityId: org.id,
      entityType: "ORGANIZATION",
      metadata: { name: org.name, slug: org.slug },
    });

    return org;
  }

  async get(context: AuthContext, orgId: string) {
    await this.authz.requireRead(context, orgId);
    return this.repo.findById(orgId);
  }

  async getBySlug(context: AuthContext, slug: string) {
    const org = await this.repo.findBySlug(slug);
    if (org) {
      await this.authz.requireRead(context, org.id);
    }
    return org;
  }

  async update(
    context: AuthContext,
    orgId: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      logoUrl?: string;
    }
  ) {
    await this.authz.requireUpdate(context, orgId);
    const org = await this.repo.update(orgId, data);

    await this.repo.createActivity({
      userId: context.userId,
      action: "ORG_UPDATED",
      organizationId: org.id,
      entityId: org.id,
      entityType: "ORGANIZATION",
      metadata: { changes: data },
    });

    return org;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async delete(context: AuthContext, orgId: string, cascade: boolean = false) {
    await this.authz.requireDelete(context, orgId);

    if (!cascade) {
      const projectCount = await this.repo.countProjects(orgId);
      if (projectCount > 0) {
        throw new DbError(
          DbErrorCode.DEPENDENCY_CONFLICT,
          "organizationId",
          `Organization '${orgId}' cannot be deleted because it contains ${projectCount} project(s). Use cascade delete if you want to remove everything.`
        );
      }
    }

    const org = await this.repo.findById(orgId);
    if (org) {
      await this.repo.createActivity({
        userId: context.userId,
        action: "ORG_DELETED",
        organizationId: orgId,
        entityId: orgId,
        entityType: "ORGANIZATION",
        metadata: { name: org.name, cascade },
      });
    }

    await this.repo.delete(orgId);
  }

  async listMembers(context: AuthContext, orgId: string) {
    await this.authz.requireRead(context, orgId);
    return this.repo.listMembers(orgId);
  }

  async addMember(
    context: AuthContext,
    orgId: string,
    userId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    await this.authz.requireManageMembers(context, orgId);
    return this.repo.addMember(userId, orgId, role);
  }

  async updateMemberRole(
    context: AuthContext,
    orgId: string,
    userId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    await this.authz.requireManageMembers(context, orgId);
    await this.repo.updateMemberRole(userId, orgId, role);
  }

  async removeMember(context: AuthContext, orgId: string, userId: string) {
    await this.authz.requireManageMembers(context, orgId);
    // Cleanup project memberships first
    await this.repo.removeUserFromOrgProjects(userId, orgId);
    // Then remove organization membership
    await this.repo.removeMember(userId, orgId);
  }
}
