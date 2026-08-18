import { PrismaClient } from "./generated/prisma/client.js";

export const prisma = new PrismaClient({
  adapter: process.env.DATABASE_URL,
});
