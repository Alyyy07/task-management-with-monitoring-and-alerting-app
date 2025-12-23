import { prisma } from "../../libs/prisma.js";
import { comparePassword } from "../../utils/password.js";
import crypto from "crypto";

function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

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

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        token: hashToken(raw),
        userId,
        expiresAt,
      },
    });

    return raw;
  },

  async findValidRefreshToken(rawToken: string) {
    
    return prisma.refreshToken.findFirst({
      where: {
        token: hashToken(rawToken),
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

  async createCsrfToken(userId: string) {
    const raw = crypto.randomBytes(32).toString("hex");

    await prisma.csrfToken.create({
      data: {
        userId,
        token: hashToken(raw),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    return raw;
  },

  async validateCsrfToken(userId: string, raw: string) {
    const token = await prisma.csrfToken.findFirst({
      where: {
        userId,
        token: hashToken(raw),
        expiresAt: { gt: new Date() },
      },
    });

    return Boolean(token);
  },

  async revokeCsrfTokens(userId: string) {
    await prisma.csrfToken.deleteMany({
      where: { userId },
    });
  }
};
