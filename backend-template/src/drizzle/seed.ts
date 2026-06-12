import "dotenv/config";
import { db } from "./db";
import { users } from "./schema";
import { logger } from "../lib/logger";

async function seed() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@template.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

  const [existing] = await db.select().from(users).limit(1);
  if (existing) {
    logger.info("Seed ignorado: banco já possui dados");
    process.exit(0);
  }

  await db.insert(users).values({
    email: adminEmail,
    password: await Bun.password.hash(adminPassword),
    name: "Administrador",
    role: "admin",
  });

  logger.info(`Admin criado: ${adminEmail}`);
  process.exit(0);
}

seed().catch((error) => {
  logger.error("Falha no seed", error);
  process.exit(1);
});
