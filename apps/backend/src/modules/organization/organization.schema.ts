import { FastifySchema } from "fastify";

export const createOrgSchema: FastifySchema = {
  tags: ["Organization"],
  summary: "Create a new organization",
  body: {
    type: "object",
    required: ["userId", "name"],
    properties: {
      userId: { type: "string" },
      name: { type: "string", minLength: 1, maxLength: 100 },
      slug: { type: "string", minLength: 1, maxLength: 100 },
      description: { type: "string", maxLength: 500 },
      logoUrl: { type: "string", format: "uri" },
    },
  },
  response: {
    201: {
      description: "Organization created",
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        slug: { type: "string" },
      },
    },
  },
};

export const updateOrgSchema: FastifySchema = {
  tags: ["Organization"],
  summary: "Update organization details",
  body: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100 },
      slug: { type: "string", minLength: 1, maxLength: 100 },
      description: { type: "string", maxLength: 500 },
      logoUrl: { type: "string", format: "uri" },
    },
  },
};

export const addMemberSchema: FastifySchema = {
  tags: ["Organization"],
  summary: "Add a member to an organization",
  body: {
    type: "object",
    required: ["userId", "role"],
    properties: {
      userId: { type: "string" },
      role: { type: "string", enum: ["ADMIN", "MEMBER"] },
    },
  },
};

export const listOrgSchema: FastifySchema = {
  tags: ["Organization"],
  summary: "List organizations",
  description:
    "Returns a list of organizations the user belongs to, or all if superadmin.",
  response: {
    200: {
      description: "List of organizations",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
        },
      },
    },
  },
};

export const getOrgSchema: FastifySchema = {
  tags: ["Organization"],
  summary: "Get organization by ID",
  params: {
    type: "object",
    required: ["orgId"],
    properties: {
      orgId: { type: "string" },
    },
  },
  response: {
    200: {
      description: "Organization details",
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        slug: { type: "string" },
        description: { type: "string", nullable: true },
        logoUrl: { type: "string", nullable: true },
      },
    },
  },
};

export const getOrgBySlugSchema: FastifySchema = {
  tags: ["Organization"],
  summary: "Get organization by slug",
  params: {
    type: "object",
    required: ["slug"],
    properties: {
      slug: { type: "string" },
    },
  },
};

export const deleteOrgSchema: FastifySchema = {
  tags: ["Organization"],
  summary: "Delete an organization",
  description: "Performs a soft delete on the organization.",
  params: {
    type: "object",
    required: ["orgId"],
    properties: {
      orgId: { type: "string" },
    },
  },
};

export const listOrgMembersSchema: FastifySchema = {
  tags: ["Organization"],
  summary: "List organization members",
  params: {
    type: "object",
    required: ["orgId"],
    properties: {
      orgId: { type: "string" },
    },
  },
};

export const removeOrgMemberSchema: FastifySchema = {
  tags: ["Organization"],
  summary: "Remove member from organization",
  params: {
    type: "object",
    required: ["orgId", "userId"],
    properties: {
      orgId: { type: "string" },
      userId: { type: "string" },
    },
  },
};

export const updateOrgMemberRoleSchema: FastifySchema = {
  tags: ["Organization"],
  summary: "Update member role in organization",
  params: {
    type: "object",
    required: ["orgId", "userId"],
    properties: {
      orgId: { type: "string" },
      userId: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["role"],
    properties: {
      role: { type: "string", enum: ["ADMIN", "MEMBER"] },
    },
  },
};
