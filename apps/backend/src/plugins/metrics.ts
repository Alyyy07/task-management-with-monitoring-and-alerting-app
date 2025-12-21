import fp from "fastify-plugin";
import fastifyMetrics from "fastify-metrics";
import { FastifyInstance } from "fastify";

export const metricsPlugin = fp(async (app: FastifyInstance) => {
  app.register(fastifyMetrics as any, {
    endpoint: "/metrics",
    routeMetrics: {
      enabled: true,
      groupStatusCodes: false,
    },
  });
});
