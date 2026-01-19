import { FastifySchema } from "fastify";

const loginBodySchema = {
  type: "object",
  required: ["email", "password"],
  additionalProperties: false,
  properties: {
    email: { type: "string", format: "email", minLength: 5, maxLength: 255 },
    password: { type: "string", minLength: 8, maxLength: 64 },
  },
} as const;

const registerBodySchema = {
  type: "object",
  required: ["email", "password"],
  additionalProperties: false,
  properties: {
    email: { type: "string", format: "email", minLength: 5, maxLength: 255 },
    password: { type: "string", minLength: 8, maxLength: 64 },
    firstName: { type: "string", minLength: 1, maxLength: 100 },
    lastName: { type: "string", minLength: 1, maxLength: 100 },
    avatarUrl: { type: "string", format: "uri" },
  },
} as const;

export const registerSchema: FastifySchema = {
  tags: ["Auth"],
  summary: "Register a new user",
  description: "Creates a new user account with email and password.",
  body: registerBodySchema,
  response: {
    201: {
      description: "User registered successfully",
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string", format: "email" },
      },
    },
  },
};

export const loginSchema: FastifySchema = {
  tags: ["Auth"],
  summary: "User login",
  description: "Authenticates a user and returns access and CSRF tokens.",
  body: loginBodySchema,
  response: {
    200: {
      description: "Login successful",
      type: "object",
      properties: {
        accessToken: { type: "string" },
        csrfToken: { type: "string" },
      },
    },
  },
};

export const refreshSchema: FastifySchema = {
  tags: ["Auth"],
  summary: "Refresh access token",
  description:
    "Uses valid refresh token cookie to issue new access and CSRF tokens.",
  response: {
    200: {
      description: "Token refreshed successfully",
      type: "object",
      properties: {
        accessToken: { type: "string" },
        csrfToken: { type: "string" },
      },
    },
  },
};

export const logoutSchema: FastifySchema = {
  tags: ["Auth"],
  summary: "User logout",
  description: "Revokes tokens and clears authentication cookies.",
  response: {
    200: {
      description: "Logged out successfully",
      type: "object",
      properties: {
        success: { type: "boolean" },
      },
    },
  },
};
