import type { Context } from "elysia";
import { logger } from "./logger";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleRouteError(
  ctx: Context,
  error: unknown,
  defaultMessage = "Erro interno do servidor",
): { error: string } {
  if (error instanceof AppError) {
    ctx.set.status = error.statusCode;
    return { error: error.message };
  }

  logger.error(defaultMessage, error);
  ctx.set.status = 500;
  return { error: defaultMessage };
}
