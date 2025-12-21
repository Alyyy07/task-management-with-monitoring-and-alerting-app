import { prisma } from "../../libs/prisma.js";
import { comparePassword } from "../../utils/password.js";

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  createUser(email: string, hashedPassword: string) {
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  }
};
