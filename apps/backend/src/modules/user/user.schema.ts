export const getUserByIdSchema = {
  tags: ["User"],
  summary: "Get user by ID",
  description:
    "Returns user details for the given UUID. (Requires Self/Admin access)",
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: {
      description: "User found",
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string", format: "email" },
        firstName: { type: "string", nullable: true },
        lastName: { type: "string", nullable: true },
        avatarUrl: { type: "string", format: "uri", nullable: true },
      },
    },
    404: {
      description: "User not found",
      type: "object",
      properties: {
        error: { type: "string" },
        message: { type: "string" },
      },
    },
  },
};
