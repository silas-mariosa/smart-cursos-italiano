import { Elysia, t } from "elysia";
import { handleRouteError } from "../../lib/errors";
import { verifyBearerToken } from "../../lib/auth";
import { getUserById, signIn, signUp, updateProfile } from "./handle";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/signup",
    async (ctx) => {
      try {
        const result = await signUp(ctx.body);
        if (result.error || !result.data) {
          ctx.set.status = 400;
          return { error: result.error };
        }

        const token = await ctx.jwt.sign({
          userId: result.data.id,
          name: result.data.name,
          email: result.data.email,
          role: result.data.role,
        });

        return { user: result.data, token };
      } catch (error) {
        return handleRouteError(ctx, error, "Erro ao criar conta");
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        name: t.String({ minLength: 2 }),
      }),
    },
  )
  .post(
    "/signin",
    async (ctx) => {
      try {
        const result = await signIn(ctx.body);
        if (result.error || !result.data) {
          ctx.set.status = 401;
          return { error: result.error };
        }

        const user = result.data;
        const token = await ctx.jwt.sign({
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });

        const { password: _pw, ...safeUser } = user;
        return { user: safeUser, token };
      } catch (error) {
        return handleRouteError(ctx, error, "Erro ao realizar login");
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
    },
  )
  .get("/me", async (ctx) => {
    try {
      const payload = await verifyBearerToken(ctx);
      const result = await getUserById(payload.userId);
      if (result.error || !result.data) {
        ctx.set.status = 404;
        return { error: result.error };
      }
      return { user: result.data };
    } catch (error) {
      return handleRouteError(ctx, error);
    }
  })
  .patch(
    "/me",
    async (ctx) => {
      try {
        const payload = await verifyBearerToken(ctx);
        const result = await updateProfile(payload.userId, ctx.body);
        if (result.error || !result.data) {
          ctx.set.status = 400;
          return { error: result.error };
        }
        return { user: result.data };
      } catch (error) {
        return handleRouteError(ctx, error, "Erro ao atualizar perfil");
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 2 })),
      }),
    },
  );
