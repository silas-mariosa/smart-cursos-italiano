import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { env } from "./config/env";
import { JWT } from "./jwt";
import { logger } from "./lib/logger";
import { authRoutes } from "./resource/auth/route";
import { adminRoutes } from "./resource/admin/route";
import { healthRoutes } from "./resource/health/route";

const app = new Elysia()
  .use(
    cors({
      methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      origin: env.corsOrigins.length === 1 && env.corsOrigins[0] === "*" ? true : env.corsOrigins,
      credentials: true,
    }),
  )
  .use(JWT)
  .use(healthRoutes)
  .use(authRoutes)
  .use(adminRoutes);

if (!env.isProduction) {
  app.use(
    swagger({
      documentation: {
        info: { title: "Backend Template API", version: "1.0.0" },
        tags: [
          { name: "Health", description: "Health check" },
          { name: "Auth", description: "Autenticação" },
          { name: "Admin", description: "Administração (RBAC)" },
        ],
      },
    }),
  );
}

app.listen(env.port);

logger.info(`Servidor iniciado em http://localhost:${env.port}`);

export type App = typeof app;
