import { Counter, Histogram } from "prom-client";

export const dbQueryTotal = new Counter({
  name: "db_query_total",
  help: "Total database queries",
  labelNames: ["model", "action"],
});

export const dbQueryErrorTotal = new Counter({
  name: "db_query_error_total",
  help: "Total database query errors",
  labelNames: ["model", "action"],
});

export const dbQueryDuration = new Histogram({
  name: "db_query_duration_seconds",
  help: "Database query duration in seconds",
  labelNames: ["model", "action"],
});
