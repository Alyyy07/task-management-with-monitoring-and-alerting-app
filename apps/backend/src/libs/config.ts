import fp from 'fastify-plugin';
import env from '@fastify/env';

const schema = {
  type: "object",
  required: ["PORT"],
  properties: {
    PORT: { type: "number", default: 3000 }
  }
};

export const configPlugin = fp(async (app) => {
  await app.register(env, {
    schema,
    dotenv: true
  });
});