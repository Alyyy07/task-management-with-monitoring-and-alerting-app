import fp from "fastify-plugin";
import fastifyMetrics from "fastify-metrics";
import { FastifyInstance } from "fastify";
import { customRegistry } from "../metrics/registry.js";

export const metricsPlugin = fp(async (app: FastifyInstance) => {
  app.register(fastifyMetrics as any, {
    endpoint: "/metrics",
  });

  app.addHook("onReady", async () => {
    const server = app.server;

    const originalHandler = server.listeners("request")[0];

    server.removeAllListeners("request");

    server.on("request", async (req, res) => {
      if (req.url === "/metrics") {
        res.setHeader("Content-Type", "text/plain");
        res.end(
          (await customRegistry.metrics()) +
            "\n" +
            (await app.metrics.client.register.metrics())
        );
        return;
      }

      originalHandler(req, res);
    });
  });
});
