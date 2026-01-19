import fastify from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifyCookie from "@fastify/cookie";
import { configPlugin } from "./libs/config.js";
import { authenticate } from "./plugins/authenticate.js";
import { jwtPlugin } from "./plugins/jwt.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { organizationRoutes } from "./modules/organization/organization.route.js";
import { metricsPlugin } from "./plugins/metrics.js";
import { baseRoutes } from "./modules/base/base.route.js";
import { registerErrorHandler } from "./plugins/error-handler.plugin.js";
import { tokenServicePlugin } from "./plugins/jwt-token.service.js";
import { projectDirectRoutes } from "./modules/organization/project/project.routes.js";
import { taskDirectRoutes } from "./modules/tasks/tasks.routes.js";
import { registerSwagger } from "./plugins/swagger.js";

import "./metrics/db.js";

const app = fastify({
  logger: {
    level: "info",
  },
});

registerErrorHandler(app);

app.register(helmet);
app.register(fastifyCookie);
app.register(rateLimit, {
  max: 20,
  timeWindow: "1 minute",
  allowList: (req) => {
    const excludedRoutes = ["/health", "/metrics", "/documentation"];
    return excludedRoutes.includes(req.url);
  },
});

// Documentation
await registerSwagger(app);

app.register(metricsPlugin);
app.register(configPlugin);
app.register(jwtPlugin);
app.register(tokenServicePlugin);
app.register(authenticate);

app.register(baseRoutes);
app.register(authRoutes, { prefix: "/auth" });
app.register(userRoutes, { prefix: "/users" });
app.register(organizationRoutes, { prefix: "/organizations" });
app.register(projectDirectRoutes, { prefix: "/projects" });
app.register(taskDirectRoutes, { prefix: "/tasks" });

app.get("/health", async () => ({
  status: "ok",
  uptime: process.uptime(),
}));

process.on("SIGTERM", async () => {
  app.log.info("SIGTERM received, shutting down gracefully...");
  await app.close();
  process.exit(0);
});

export default app;
