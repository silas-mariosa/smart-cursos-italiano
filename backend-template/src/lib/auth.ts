import type { Context } from "elysia";
import { AppError } from "./errors";

export type JwtPayload = {
  userId: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

type JwtPlugin = {
  sign: (payload: JwtPayload) => Promise<string>;
  verify: (token: string) => Promise<false | JwtPayload>;
};

export async function verifyBearerToken(
  ctx: Context & { jwt: JwtPlugin },
): Promise<JwtPayload> {
  const header = ctx.request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new AppError("Token de autenticação ausente", 401);
  }

  const payload = await ctx.jwt.verify(token);
  if (!payload) {
    throw new AppError("Token inválido ou expirado", 401);
  }

  return payload;
}

export async function requireAdmin(ctx: Context & { jwt: JwtPlugin }): Promise<JwtPayload> {
  const payload = await verifyBearerToken(ctx);
  if (payload.role !== "admin") {
    throw new AppError("Acesso restrito a administradores", 403);
  }
  return payload;
}
