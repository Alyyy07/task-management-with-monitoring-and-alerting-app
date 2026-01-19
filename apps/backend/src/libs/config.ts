import fp from "fastify-plugin";
import env from "@fastify/env";

const schema = {
  type: "object",
  required: ["PORT", "DATABASE_URL"],
  properties: {
    PORT: { type: "number", default: 3000 },
    DATABASE_URL: { type: "string" },
  },
};

export const configPlugin = fp(async (app) => {
  await app.register(env, {
    schema,
    dotenv: true,
  });
});
