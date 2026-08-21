import dotenv from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

dotenv.config({
  path: new URL("../.env", import.meta.url),
});
console.log(process.env.DATABASE_URL)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
});
