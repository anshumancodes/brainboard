import express from "express";
import type { Request, Response } from "express";
import middleware from "./middlware.js";
import { UserSchema } from "@repo/common/types";
import { prisma } from "@repo/database";
const app = express();

app.listen(8000, () => {
  console.log("http server started at port 8000");
});

app.post("/signin", signIn);
app.post("/signup", signup);
app.post("/room", middleware, createRoom);

async function signup(req: Request, res: Response) {
  const { name, username, email, password } = req.body;

  const validate = UserSchema.safeParse({
    name,
    username,
    email,
    password,
  });

  if (!validate.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: validate.error.flatten(),
    });
  }

  const doesExist = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (doesExist) {
    return res.status(409).json({
      message: "User with this username already exists",
    });
  }

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
    },
  });

  return res.status(201).json({
    message: "Signup successful",
    user,
  });
}

async function signIn(req: Request, res: Response) {}

async function createRoom(params: string) {}
