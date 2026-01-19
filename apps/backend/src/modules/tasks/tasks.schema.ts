import { FastifySchema } from "fastify";

export const createTaskSchema: FastifySchema = {
  tags: ["Task"],
  summary: "Create a new task",
  body: {
    type: "object",
    required: ["title", "description"],
    properties: {
      title: { type: "string", minLength: 1, maxLength: 255 },
      description: { type: "string", minLength: 1 },
      priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
      dueDate: { type: "string", format: "date-time" },
      position: { type: "number" },
    },
  },
  response: {
    201: {
      description: "Task created",
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        status: { type: "string" },
      },
    },
  },
};

export const updateTaskSchema: FastifySchema = {
  tags: ["Task"],
  summary: "Update an existing task",
  body: {
    type: "object",
    properties: {
      title: { type: "string", minLength: 1, maxLength: 255 },
      description: { type: "string", minLength: 1 },
      status: {
        type: "string",
        enum: [
          "BACKLOG",
          "TODO",
          "IN_PROGRESS",
          "IN_REVIEW",
          "DONE",
          "CANCELED",
        ],
      },
      priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
      dueDate: { type: "string", format: "date-time" },
      position: { type: "number" },
    },
  },
};

export const assignTaskSchema: FastifySchema = {
  tags: ["Task"],
  summary: "Assign task to a user",
  body: {
    type: "object",
    required: ["assigneeId"],
    properties: {
      assigneeId: { type: "string" },
    },
  },
};

export const listTasksSchema: FastifySchema = {
  tags: ["Task"],
  summary: "List tasks in project",
  params: {
    type: "object",
    required: ["projectId"],
    properties: {
      projectId: { type: "string" },
    },
  },
};

export const getTaskSchema: FastifySchema = {
  tags: ["Task"],
  summary: "Get task by ID",
  params: {
    type: "object",
    required: ["taskId"],
    properties: {
      taskId: { type: "string" },
    },
  },
};

export const deleteTaskSchema: FastifySchema = {
  tags: ["Task"],
  summary: "Delete a task",
  description: "Performs a soft delete on the task.",
  params: {
    type: "object",
    required: ["taskId"],
    properties: {
      taskId: { type: "string" },
    },
  },
};
