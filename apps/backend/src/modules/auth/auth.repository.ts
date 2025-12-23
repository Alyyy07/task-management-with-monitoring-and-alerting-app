import { prisma } from "../../libs/prisma.js";
import { comparePassword } from "../../utils/password.js";
import crypto from "crypto";

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
  },

  async createRefreshToken(userId: string) {
    const raw = crypto.randomBytes(64).toString("hex");
    const hash = crypto.createHash("sha256").update(raw).digest("hex");

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        token: hash,
        userId,
        expiresAt,
      },
    });

    return raw;
  },

  async findValidRefreshToken(rawToken: string) {
    const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

    return prisma.refreshToken.findFirst({
      where: {
        tokenHash: hash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  },

  async revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  },
};
