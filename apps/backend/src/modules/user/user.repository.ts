import { prisma } from "../../libs/prisma.js";
import { UserRepository } from "./user.types.js";

export const userRepository: UserRepository = {
  findById: async (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  },
};
