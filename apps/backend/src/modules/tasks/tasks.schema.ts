export const CreateTaskSchema = {
    type: "object",
    required: ["title", "description", "organizationId"],
    additionalProperties: false,
    properties: {
        title: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: "string", minLength: 0, maxLength: 1000 },
        organizationId: { type: "string", format: "uuid" },
    },
};

export const UpdateTaskSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
        title: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: "string", minLength: 0, maxLength: 1000 },
    },
};
