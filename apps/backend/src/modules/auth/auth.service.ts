import { prisma } from "../../libs/prisma.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { createAuditLog } from "../audit/audit.service.js";

export async function registerUser(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("USER_EXISTS");
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: await hashPassword(password),
    },
  });

  await createAuditLog({
    userId: user.id,
    action: "REGISTER",
  });

  return { id: user.id, email: user.email };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  await createAuditLog({
    userId: user.id,
    action: "LOGIN",
  });

  return user;
}