import { Elysia, t } from "elysia";
import { handleRouteError } from "../../lib/errors";
import { requireAdmin } from "../../lib/auth";
import { getAdminStats, listUsers, updateUserRole } from "./handle";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .get("/stats", async (ctx) => {
    try {
      await requireAdmin(ctx);
      const result = await getAdminStats();
      if (result.error || !result.data) {
        ctx.set.status = 500;
        return { error: result.error };
      }
      return result.data;
    } catch (error) {
      return handleRouteError(ctx, error);
    }
  })
  .get(
    "/users",
    async (ctx) => {
      try {
        await requireAdmin(ctx);
        const result = await listUsers({
          page: ctx.query.page,
          limit: ctx.query.limit,
          search: ctx.query.search,
        });
        if (result.error || !result.data) {
          ctx.set.status = 500;
          return { error: result.error };
        }
        return result.data;
      } catch (error) {
        return handleRouteError(ctx, error);
      }
    },
    {
      query: t.Object({
        page: t.Numeric({ default: 1, minimum: 1 }),
        limit: t.Numeric({ default: 20, minimum: 1, maximum: 100 }),
        search: t.Optional(t.String()),
      }),
    },
  )
  .patch(
    "/users/:id/role",
    async (ctx) => {
      try {
        await requireAdmin(ctx);
        const result = await updateUserRole(ctx.params.id, ctx.body.role);
        if (result.error || !result.data) {
          ctx.set.status = 400;
          return { error: result.error };
        }
        return { user: result.data };
      } catch (error) {
        return handleRouteError(ctx, error);
      }
    },
    {
      params: t.Object({ id: t.String({ format: "uuid" }) }),
      body: t.Object({
        role: t.Union([t.Literal("user"), t.Literal("admin")]),
      }),
    },
  );
