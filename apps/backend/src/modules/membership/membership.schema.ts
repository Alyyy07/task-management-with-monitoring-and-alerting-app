import { FastifySchema } from "fastify";

export const addMemberSchema: FastifySchema = {
  params: {
    type: "object",
    required: ["orgId"],
    properties: {
      orgId: {
        type: "string",
        format: "uuid",
      },
    },
  },

  body: {
    type: "object",
    required: ["userId", "role"],
    properties: {
      userId: {
        type: "string",
        format: "uuid",
      },
      role: {
        type: "string",
        enum: ["ADMIN", "MEMBER"],
      },
    },
    additionalProperties: false,
  },

  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        userId: { type: "string", format: "uuid" },
        orgId: { type: "string", format: "uuid" },
        role: { type: "string" },
      },
    },
  },
};
