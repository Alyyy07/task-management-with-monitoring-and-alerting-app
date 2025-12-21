import fastify from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { configPlugin } from "./libs/config.js";
import { authenticate } from "./plugins/authenticate.js";
import { jwtPlugin } from "./plugins/jwt.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { organizationRoutes } from "./modules/organization/organization.route.js";
import { membershipRoutes } from "./modules/membership/membership.route.js";
import { metricsPlugin } from "./plugins/metrics.js";
import { testRoutes } from "./modules/tes/tes.route.js";
import "./metrics/db.js";

const app = fastify({
  logger: {
    level: "info",
  },
});

app.register(helmet);
app.register(rateLimit, {
  max: 10,
  timeWindow: "1 minute",
  allowList: (req) => {
    const excludedRoutes = ["/health", "/metrics"];
    return excludedRoutes.includes(req.url);
  },
});
app.register(metricsPlugin);
app.register(configPlugin);
app.register(jwtPlugin);
app.register(authenticate);

app.register(testRoutes);
app.register(authRoutes, { prefix: "/auth" });
app.register(userRoutes, { prefix: "/users" });
app.register(organizationRoutes, { prefix: "/organizations" });
app.register(membershipRoutes, { prefix: "/organizations" });

app.get("/health", async () => ({
  status: "ok",
  uptime: process.uptime(),
}));

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});

process.on("SIGTERM", async () => {
  app.log.info("SIGTERM received, shutting down gracefully...");
  await app.close();
  process.exit(0);
});

export default app;
