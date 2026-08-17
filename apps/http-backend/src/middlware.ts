import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import JWT_SECRET from "@repo/backend-common/config"

export const JWT_KEY = new TextEncoder().encode(JWT_SECRET);
export default async function middleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers["authorization"] ?? " ";
  if (!token) {
    return res.status(401).json({
      message: "unauthorised",
    });
  }
  const decoded = await jwtVerify(token, JWT_KEY);
  if (decoded) {
    // @ts-ignore
    req.user = decoded.userId as string;
    next();
  } else {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}
