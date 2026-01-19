export enum DbErrorCode {
  RECORD_NOT_FOUND = "RECORD_NOT_FOUND",
  FOREIGN_KEY_VIOLATION = "FOREIGN_KEY_VIOLATION",
  UNIQUE_CONSTRAINT_VIOLATION = "UNIQUE_CONSTRAINT_VIOLATION",
  INVALID_REFERENCE = "INVALID_REFERENCE",
  DEPENDENCY_CONFLICT = "DEPENDENCY_CONFLICT",
}

export const DbErrorStatus: Record<DbErrorCode, number> = {
  [DbErrorCode.RECORD_NOT_FOUND]: 404,
  [DbErrorCode.FOREIGN_KEY_VIOLATION]: 400,
  [DbErrorCode.UNIQUE_CONSTRAINT_VIOLATION]: 409,
  [DbErrorCode.INVALID_REFERENCE]: 400,
  [DbErrorCode.DEPENDENCY_CONFLICT]: 409,
};

export class DbError extends Error {
  constructor(
    public readonly code: DbErrorCode,
    public readonly field?: string,
    public readonly details?: string
  ) {
    super(code);
    this.name = "DbError";
  }
}

// Helper to check if error is a Prisma error
export function isPrismaError(
  error: unknown
): error is { code: string; meta?: any } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "string"
  );
}

// Map Prisma error codes to DbError
export function mapPrismaError(error: unknown): DbError {
  if (!isPrismaError(error)) {
    throw error;
  }

  const prismaCode = error.code;
  const meta = error.meta;

  switch (prismaCode) {
    case "P2025": // Record not found
      return new DbError(
        DbErrorCode.RECORD_NOT_FOUND,
        meta?.modelName,
        meta?.cause || "Record to update or delete does not exist"
      );

    case "P2003": // Foreign key constraint failed
      return new DbError(
        DbErrorCode.FOREIGN_KEY_VIOLATION,
        meta?.field_name,
        `Foreign key constraint failed on field: ${
          meta?.field_name || "unknown"
        }`
      );

    case "P2002": // Unique constraint failed
      return new DbError(
        DbErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
        meta?.target?.[0],
        `Unique constraint failed on field: ${
          meta?.target?.join(", ") || "unknown"
        }`
      );

    case "P2001": // Record required but not found
      return new DbError(
        DbErrorCode.RECORD_NOT_FOUND,
        meta?.modelName,
        `Required record was not found: ${meta?.modelName || "unknown"}`
      );

    default:
      // Re-throw unknown Prisma errors
      throw error;
  }
}
