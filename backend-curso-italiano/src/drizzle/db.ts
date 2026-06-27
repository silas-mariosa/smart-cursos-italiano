import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env";
import * as schema from "./schema";

export const connection = postgres(env.dbConnection, { prepare: false });
export const db = drizzle(connection, { schema });
