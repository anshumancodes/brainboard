import dotenv from "dotenv";

dotenv.config({
  path: new URL("../.env", import.meta.url),
});

const JWT_KEY = process.env.JWT_SECRET;
const PROD_CORS_ORIGIN = process.env.PROD_CORS_ORIGIN;
const DEV_CORS_ORIGIN = process.env.DEV_CORS_ORIGIN;

if (!JWT_KEY) {
  throw new Error(
    "JWT_SECRET failed to load — check .env path in @repo/backend-common/config",
  );
}

const JWT_SECRET = new TextEncoder().encode(JWT_KEY);

export {
  JWT_SECRET,
  PROD_CORS_ORIGIN,
  DEV_CORS_ORIGIN,
};