import fastify from "fastify";
import { configPlugin } from "./libs/config.js";
import { prisma } from "./libs/prisma.js";
import { authenticate } from "./plugins/authenticate.js";
import { jwtPlugin } from "./plugins/jwt.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";

const app = fastify({
  logger: {
    level: "info",
  },
});

app.register(configPlugin);
app.register(jwtPlugin);
app.register(authenticate);

app.get("/", async (request, reply) => {
  return { hello: "world" };
});

app.get("/db-test", async (request, reply) => {
  const users = await prisma.user.findMany();
  return { users };
});

app.register(authRoutes, { prefix: "/auth" });
app.register(userRoutes, { prefix: "/users" });

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});

export default app;
