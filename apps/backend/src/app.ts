import fastify from "fastify";
import { configPlugin } from "./libs/config.js";

const app = fastify({
  logger: {
    level: "info",
  },
});

app.register(configPlugin);

app.get("/", async (request, reply) => {
  return { hello: "world" };
});

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});

export default app;
