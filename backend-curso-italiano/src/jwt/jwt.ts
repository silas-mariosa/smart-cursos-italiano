import { jwt } from "@elysiajs/jwt";
import { env } from "../config/env";

export const JWT = jwt({
  name: "jwt",
  secret: env.jwtSecret,
});
