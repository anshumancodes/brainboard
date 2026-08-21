import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "@repo/backend-common/config";

export default async function middleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Invalid authorization header",
    });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.userId || typeof payload.userId !== "string") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
