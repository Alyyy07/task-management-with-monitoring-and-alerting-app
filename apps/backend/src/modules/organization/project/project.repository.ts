import { prisma } from "../../../libs/prisma.js";
import { Membership } from "../organization.type.js";
import { ProjectRepository } from "./project.types.js";


const NOT_MEMBER = { status: "NOT_MEMBER" } as const;
const NOT_FOUND = { status: "NOT_FOUND" } as const;
const MEMBER = (role: "ADMIN" | "MEMBER") =>
  ({ status: "MEMBER", role } as const);

async function projectExists(projectId: string): Promise<boolean> {
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });
  return !!p;
}

/**
 * Helper yang memeriksa apakah user adalah member organisasi (org-level).
 * Mengembalikan truthy membership object jika ada, otherwise null.
 */
async function getOrgMembership(userId: string, organizationId: string) {
  return prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
}

export const projectRepository: ProjectRepository = {
  async create(data: {
    name: string;
    organizationId: string;
    createdById: string;
  }) {
    return prisma.project.create({ data });
  },

  async findById(id: string) {
    return prisma.project.findUnique({ where: { id } });
  },

  async findByOrganization(organizationId: string) {
    return prisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  },

  async update(id: string, data: { name?: string }) {
    return prisma.project.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },

  /**
   * Ambil membership user pada project.
   * Mengembalikan:
   *  - { status: "MEMBER", role } jika ada
   *  - NOT_MEMBER jika project ada tapi user bukan member
   *  - NOT_FOUND jika project tidak ada
   */
  async getMembership(userId: string, projectId: string): Promise<Membership> {
    const membership = await prisma.projectMembership.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (!membership) {
      const exists = await projectExists(projectId);
      return exists ? NOT_MEMBER : NOT_FOUND;
    }

    return MEMBER(membership.role);
  },

  /**
   * Cek apakah user adalah creator dari project
   * Mengembalikan: "CREATOR" | "NOT_CREATOR" | "NOT_FOUND"
   */
  async isCreator(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { createdById: true },
    });

    if (!project) return "NOT_FOUND";
    return project.createdById === userId ? "CREATOR" : "NOT_CREATOR";
  },

  async listMembers(projectId: string) {
    return prisma.projectMembership.findMany({
      where: { projectId },
      orderBy: { role: "asc" },
    });
  },

  /**
   * Tambah member ke project.
   *  - Pastikan user adalah member org dulu.
   *  - Jika project tidak ada => return NOT_FOUND
   *  - Jika user bukan member org => return NOT_MEMBER
   *  - Jika sudah jadi member project, kembalikan record yang ada (idempotent)
   */
  async addMember(
    userId: string,
    organizationId: string,
    projectId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    const orgMembership = await getOrgMembership(userId, organizationId);
    if (!orgMembership) {
      const exists = await projectExists(projectId);
      return exists ? NOT_MEMBER : NOT_FOUND;
    }

    const existing = await prisma.projectMembership.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (existing) return existing;

    return prisma.projectMembership.create({
      data: { userId, projectId, role },
    });
  },

  /**
   * Remove member from project.
   * - Pastikan user adalah member org dulu.
   * - Jika project tidak ada => NOT_FOUND
   * - Jika org check OK tapi user bukan member project => NOT_MEMBER
   */
  async removeMember(
    userId: string,
    organizationId: string,
    projectId: string
  ) {
    const orgMembership = await getOrgMembership(userId, organizationId);
    if (!orgMembership) {
      const exists = await projectExists(projectId);
      return exists ? NOT_MEMBER : NOT_FOUND;
    }

    const existing = await prisma.projectMembership.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!existing) {
      return NOT_MEMBER;
    }

    return prisma.projectMembership.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  },

  /**
   * Change role of a member in a project.
   * - Pastikan user adalah member org dulu.
   * - Jika project tidak ada => NOT_FOUND
   * - Jika org check OK tapi user bukan member project => NOT_MEMBER
   */
  async changeMemberRole(
    userId: string,
    organizationId: string,
    projectId: string,
    role: "ADMIN" | "MEMBER"
  ) {
    const orgMembership = await getOrgMembership(userId, organizationId);
    if (!orgMembership) {
      const exists = await projectExists(projectId);
      return exists ? NOT_MEMBER : NOT_FOUND;
    }

    const existing = await prisma.projectMembership.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!existing) {
      return NOT_MEMBER;
    }

    return prisma.projectMembership.update({
      where: { projectId_userId: { projectId, userId } },
      data: { role },
    });
  },
};
