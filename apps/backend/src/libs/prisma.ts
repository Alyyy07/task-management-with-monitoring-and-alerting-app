import { PrismaClient } from "@prisma/client";
import {
  dbQueryTotal,
  dbQueryDuration,
  dbQueryErrorTotal,
} from "../metrics/db.js";

export const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const start = process.hrtime();

        try {
          const result = await query(args);

          const diff = process.hrtime(start);
          const duration = diff[0] + diff[1] / 1e9;

          dbQueryTotal.inc({
            model: model ?? "unknown",
            action: operation,
          });

          dbQueryDuration.observe(
            {
              model: model ?? "unknown",
              action: operation,
            },
            duration
          );

          return result;
        } catch (error) {
          dbQueryErrorTotal.inc({
            model: model ?? "unknown",
            action: operation,
          });
          throw error;
        }
      },
    },
  },
});
