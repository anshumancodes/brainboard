import bcrypt from "bcrypt";

export default async function hashPassword(
  plainTextPassword: string,
): Promise<string> {
  const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
  return hashedPassword;
}

export async function validatePassoword(
  hashedPassword: string,
  userpassowrd: string,
): Promise<boolean> {
  const validationresult = bcrypt.compare(userpassowrd, hashedPassword);

  return validationresult;
}
