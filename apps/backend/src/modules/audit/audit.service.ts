import { prisma } from "../../libs/prisma.js";
import { AuditAction } from "./audit.types.js";

interface AuditLogInput {
  userId: string;
  action: AuditAction;
  organizationId?: string;
  metadata?: Record<string, any>;
}

export async function createAuditLog({
  userId,
  action,
  organizationId,
  metadata
}: AuditLogInput) {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      organizationId,
      metadata
    }
  });
}
