import fastify from "fastify";
import { configPlugin } from "./libs/config.js";
import { prisma } from "./libs/prisma.js";
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
app.register(metricsPlugin);
app.register(configPlugin);
app.register(jwtPlugin);
app.register(authenticate);

app.register(testRoutes);
app.register(authRoutes, { prefix: "/auth" });
app.register(userRoutes, { prefix: "/users" });
app.register(organizationRoutes, { prefix: "/organizations" });
app.register(membershipRoutes, { prefix: "/organizations" });

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});

export default app;
