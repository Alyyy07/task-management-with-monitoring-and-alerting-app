import { Counter } from "prom-client";
import { customRegistry } from "./registry.js";

export const loginSuccessTotal = new Counter({
  name: "app_login_success_total",
  help: "Total successful login",
  registers: [customRegistry],
});

export const loginFailureTotal = new Counter({
  name: "app_login_failure_total",
  help: "Total failed login",
  registers: [customRegistry],
});
