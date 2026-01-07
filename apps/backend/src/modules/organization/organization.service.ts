import { prisma } from "../../libs/prisma.js";
import { AuthContext } from "../authz/authz.type.js";
import { OrganizationAuthz } from "./organization.authz.js";
import { OrganizationRepository } from "./organization.type.js";

export class OrganizationService {
  constructor(
    private readonly repo: OrganizationRepository,
    private readonly authz: OrganizationAuthz
  ) {}

  async listOrg(context: AuthContext) {
    return await this.repo.listOrgByUser(context.userId, context.isSuperAdmin);
  }

  async create(context: AuthContext, name: string) {
    const org = await this.repo.create({ name, createdById: context.userId });

    await this.repo.addMember(context.userId, org.id, "OWNER");

    return org;
  }

  async get(context: AuthContext, orgId: string) {
    await this.authz.requireRead(context, orgId);
    return this.repo.findById(orgId);
  }

  async update(context: AuthContext, orgId: string, data: { name?: string }) {
    await this.authz.requireUpdate(context, orgId);
    return this.repo.update(orgId, data);
  }

  async delete(context: AuthContext, orgId: string) {
    await this.authz.requireDelete(context, orgId);
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
    await this.repo.removeMember(userId, orgId);
  }
}
