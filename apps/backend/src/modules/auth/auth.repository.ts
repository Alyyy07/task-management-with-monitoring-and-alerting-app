import crypto from "crypto";
import { prisma } from "../../libs/prisma.js";
import { AuthRepository } from "./auth.types.js";

function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export const authRepository: AuthRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  createUser(email, hashedPassword) {
    return prisma.user.create({
      data: { email, password: hashedPassword },
    });
  },

  async storeRefreshToken(userId, rawToken, expiresAt) {
    await prisma.refreshToken.create({
      data: {
        userId,
        token: hashToken(rawToken),
        expiresAt,
      },
    });
  },

  async findValidRefreshToken(rawToken) {
    return prisma.refreshToken.findFirst({
      where: {
        token: hashToken(rawToken),
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userId: true,
      },
    });
  },

  async revokeRefreshToken(id) {
    await prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  },

  async revokeAllRefreshTokens(userId) {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  },

  async storeCsrfToken(userId, rawToken, expiresAt) {
    await prisma.csrfToken.create({
      data: {
        userId,
        token: hashToken(rawToken),
        expiresAt,
      },
    });
  },

  async revokeCsrfTokens(userId) {
    await prisma.csrfToken.deleteMany({
      where: { userId },
    });
  },
};