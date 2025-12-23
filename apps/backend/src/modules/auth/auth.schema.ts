import { FastifySchema } from "fastify";

const authBodySchema = {
  type: "object",
  required: ["email", "password"],
  additionalProperties: false,
  properties: {
    email: {
      type: "string",
      format: "email",
      minLength: 5,
      maxLength: 255,
    },
    password: {
      type: "string",
      minLength: 8,
      maxLength: 64,
    },
  },
} as const;

export const registerSchema: FastifySchema = {
  body: authBodySchema,
  response: {
    201: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        email: { type: "string", format: "email" },
      },
    },
  },
};

export const loginSchema: FastifySchema = {
  body: authBodySchema,
  response: {
    200: {
      type: "object",
      properties: {
        accessToken: { type: "string" },
        csrfToken: { type: "string" },
      },
    },
  },
};

export const refreshSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["refreshToken"],
    additionalProperties: false,
    properties: {
      refreshToken: {
        type: "string",
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        accessToken: { type: "string" },
        csrfToken: { type: "string" },
      },
    },
  },
};
export const logoutSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["refreshToken"],
    additionalProperties: false,
    properties: {
      refreshToken: {
        type: "string",
      },
    },
  },
  response: {
    204: {
      type: "object",
    },
  },
};
