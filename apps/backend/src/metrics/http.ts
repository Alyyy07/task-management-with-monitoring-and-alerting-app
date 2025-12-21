import { Counter, Histogram } from "prom-client";
import { customRegistry } from "./registry.js";

export const httpRequestTotal = new Counter({
  name: "app_http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [customRegistry],
});

export const httpRequestDuration = new Histogram({
  name: "app_http_request_duration_seconds",
  help: "HTTP request duration",
  labelNames: ["method", "route", "status"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2],
  registers: [customRegistry],
});
