import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { JWT_SECRET } from "@repo/backend-common/config";

export default async function hashPassword(
  plainTextPassword: string,
): Promise<string> {
  const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
  return hashedPassword;
}

export async function validatePassword(
  hashedPassword: string,
  userpassowrd: string,
): Promise<boolean> {
  const validationresult = bcrypt.compare(userpassowrd, hashedPassword);

  return validationresult;
}

export async function createToken(payload: Record<string, unknown>) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}
