export const createOrgSchema = {
    body: {
    type: "object",
    required: ["userId", "name"],
    properties: {
      userId: {
        type: "string",
      },
      name: {
        type: "string",
      },
    },
  },
}