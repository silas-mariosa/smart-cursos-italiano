import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../drizzle/db";
import { users, type User } from "../../drizzle/schema";
import { fail, ok, type Result } from "../../lib/result";

type SignUpBody = {
  email: string;
  password: string;
  name: string;
};

type SignInBody = {
  email: string;
  password: string;
};

export async function signUp(body: SignUpBody): Promise<Result<Omit<User, "password">>> {
  try {
    const [created] = await db
      .insert(users)
      .values({
        email: body.email.toLowerCase().trim(),
        password: await Bun.password.hash(body.password),
        name: body.name.trim(),
        role: "user",
      })
      .returning();

    const { password: _pw, ...safe } = created;
    return ok(safe);
  } catch (error) {
    const message = (error as Error).message;
    if (message.includes("unique")) {
      return fail("E-mail já cadastrado");
    }
    return fail("Não foi possível criar a conta");
  }
}

export async function signIn(body: SignInBody): Promise<Result<User>> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, body.email.toLowerCase().trim()), isNull(users.deletedAt)));

    if (!user) {
      return fail("Credenciais inválidas");
    }

    const valid = await Bun.password.verify(body.password, user.password);
    if (!valid) {
      return fail("Credenciais inválidas");
    }

    return ok(user);
  } catch {
    return fail("Não foi possível realizar o login");
  }
}

export async function getUserById(id: string): Promise<Result<Omit<User, "password">>> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)));

    if (!user) {
      return fail("Usuário não encontrado");
    }

    const { password: _pw, ...safe } = user;
    return ok(safe);
  } catch {
    return fail("Não foi possível buscar o usuário");
  }
}

export async function updateProfile(
  id: string,
  data: { name?: string },
): Promise<Result<Omit<User, "password">>> {
  try {
    const [updated] = await db
      .update(users)
      .set({
        ...(data.name ? { name: data.name.trim() } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();

    if (!updated) {
      return fail("Usuário não encontrado");
    }

    const { password: _pw, ...safe } = updated;
    return ok(safe);
  } catch {
    return fail("Não foi possível atualizar o perfil");
  }
}
