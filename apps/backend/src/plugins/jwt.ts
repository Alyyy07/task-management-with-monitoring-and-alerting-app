import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export const jwtPlugin = fp(async (app) => {
  app.register(jwt, {
    secret: process.env.JWT_SECRET!
  });
});