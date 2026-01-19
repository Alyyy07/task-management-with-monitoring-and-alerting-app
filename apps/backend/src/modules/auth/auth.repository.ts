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

  createUser(email, hashedPassword, profile) {
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        avatarUrl: profile?.avatarUrl,
      },
    });
  },

  async storeRefreshToken(userId, rawToken, expiresAt) {
    return prisma.refreshToken.create({
      data: {
        userId,
        token: hashToken(rawToken),
        expiresAt,
      },
      select: { id: true },
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

  async storeCsrfToken(userId, rawToken, expiresAt, refreshTokenId) {
    await prisma.csrfToken.create({
      data: {
        userId,
        token: hashToken(rawToken),
        expiresAt,
        refreshTokenId,
      },
    });
  },

  async revokeCsrfTokens(userId) {
    await prisma.csrfToken.deleteMany({
      where: { userId },
    });
  },

  async revokeCsrfTokensBySession(refreshTokenId) {
    await prisma.csrfToken.deleteMany({
      where: { refreshTokenId },
    });
  },

  async validateCsrfToken(refreshToken: string, rawCsrf: string) {
    const storedRefresh = await prisma.refreshToken.findFirst({
      where: {
        token: hashToken(refreshToken),
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, userId: true },
    });

    if (!storedRefresh) return false;

    const csrf = await prisma.csrfToken.findFirst({
      where: {
        userId: storedRefresh.userId,
        token: hashToken(rawCsrf),
        expiresAt: { gt: new Date() },
        OR: [
          { refreshTokenId: storedRefresh.id },
          { refreshTokenId: null }, // Fallback for legacy / un-bound tokens
        ],
      },
    });

    return Boolean(csrf);
  },
};
