import { FastifySchema } from "fastify";

export const createProjectSchema: FastifySchema = {
  tags: ["Project"],
  summary: "Create a new project",
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100 },
      slug: { type: "string", minLength: 1, maxLength: 100 },
      description: { type: "string", maxLength: 500 },
      startDate: { type: "string", format: "date-time" },
      endDate: { type: "string", format: "date-time" },
    },
  },
  response: {
    201: {
      description: "Project created",
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        slug: { type: "string" },
      },
    },
  },
};

export const updateProjectSchema: FastifySchema = {
  tags: ["Project"],
  summary: "Update project details",
  body: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100 },
      slug: { type: "string", minLength: 1, maxLength: 100 },
      description: { type: "string", maxLength: 500 },
      status: {
        type: "string",
        enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"],
      },
      startDate: { type: "string", format: "date-time" },
      endDate: { type: "string", format: "date-time" },
    },
  },
};

export const addProjectMemberSchema: FastifySchema = {
  tags: ["Project"],
  summary: "Add a member to a project",
  body: {
    type: "object",
    required: ["userId", "role"],
    properties: {
      userId: { type: "string" },
      role: { type: "string", enum: ["ADMIN", "MEMBER"] },
    },
  },
};

export const listProjectsSchema: FastifySchema = {
  tags: ["Project"],
  summary: "List projects in organization",
  params: {
    type: "object",
    required: ["orgId"],
    properties: {
      orgId: { type: "string" },
    },
  },
};

export const getProjectBySlugSchema: FastifySchema = {
  tags: ["Project"],
  summary: "Get project by slug",
  params: {
    type: "object",
    required: ["orgId", "slug"],
    properties: {
      orgId: { type: "string" },
      slug: { type: "string" },
    },
  },
};

export const getProjectSchema: FastifySchema = {
  tags: ["Project"],
  summary: "Get project by ID",
  params: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: { type: "string" },
    },
  },
};

export const deleteProjectSchema: FastifySchema = {
  tags: ["Project"],
  summary: "Delete a project",
  description: "Performs a soft delete on the project.",
  params: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: { type: "string" },
    },
  },
};

export const listProjectMembersSchema: FastifySchema = {
  tags: ["Project"],
  summary: "List project members",
  params: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: { type: "string" },
    },
  },
};

export const removeProjectMemberSchema: FastifySchema = {
  tags: ["Project"],
  summary: "Remove member from project",
  params: {
    type: "object",
    required: ["projectId", "userId"],
    properties: {
      projectId: { type: "string" },
      userId: { type: "string" },
    },
  },
};

export const updateProjectMemberRoleSchema: FastifySchema = {
  tags: ["Project"],
  summary: "Update member role in project",
  params: {
    type: "object",
    required: ["projectId", "userId"],
    properties: {
      projectId: { type: "string" },
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
