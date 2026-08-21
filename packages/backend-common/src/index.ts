import dotenv from "dotenv";

dotenv.config({
  path: new URL("../.env", import.meta.url),
});

const JWT_KEY = process.env.JWT_SECRET;
if (!JWT_KEY) {
  throw new Error(
    "JWT_SECRET failed to load — check .env path in @repo/backend-common/config",
  );
}

export const JWT_SECRET = new TextEncoder().encode(JWT_KEY);
