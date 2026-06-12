import { and, count, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "../../drizzle/db";
import { users, type User } from "../../drizzle/schema";
import { fail, ok, type Result } from "../../lib/result";

type ListUsersParams = {
  page: number;
  limit: number;
  search?: string;
};

export type AdminStats = {
  totalUsers: number;
  totalAdmins: number;
};

export async function getAdminStats(): Promise<Result<AdminStats>> {
  try {
    const [total] = await db
      .select({ value: count() })
      .from(users)
      .where(isNull(users.deletedAt));

    const [admins] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, "admin"), isNull(users.deletedAt)));

    return ok({
      totalUsers: total?.value ?? 0,
      totalAdmins: admins?.value ?? 0,
    });
  } catch {
    return fail("Não foi possível carregar estatísticas");
  }
}

export async function listUsers(
  params: ListUsersParams,
): Promise<Result<{ users: Omit<User, "password">[]; total: number }>> {
  try {
    const offset = (params.page - 1) * params.limit;
    const search = params.search?.trim();

    const whereClause = search
      ? and(
          isNull(users.deletedAt),
          or(ilike(users.email, `%${search}%`), ilike(users.name, `%${search}%`)),
        )
      : isNull(users.deletedAt);

    const rows = await db
      .select()
      .from(users)
      .where(whereClause)
      .limit(params.limit)
      .offset(offset);

    const [totalRow] = await db.select({ value: count() }).from(users).where(whereClause);

    const safeUsers = rows.map(({ password: _pw, ...user }) => user);
    return ok({ users: safeUsers, total: totalRow?.value ?? 0 });
  } catch {
    return fail("Não foi possível listar usuários");
  }
}

export async function updateUserRole(
  userId: string,
  role: "user" | "admin",
): Promise<Result<Omit<User, "password">>> {
  try {
    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .returning();

    if (!updated) {
      return fail("Usuário não encontrado");
    }

    const { password: _pw, ...safe } = updated;
    return ok(safe);
  } catch {
    return fail("Não foi possível atualizar o usuário");
  }
}
