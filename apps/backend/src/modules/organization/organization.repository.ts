import { prisma } from "../../libs/prisma.js";
import { OrganizationRepository } from "./organization.type.js";

export const organizationRepository: OrganizationRepository = {
  async isMember(userId: string, organizationId: string) {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    return Boolean(membership);
  },

  async findById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });
  },
};
