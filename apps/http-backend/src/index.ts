import express from "express";
import type { Request, Response } from "express";
import middleware from "./middlware.js";
import { UserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";
import { prisma } from "@repo/database";
import hashPassword from "./utils/utils.js";
import { validatePassoword } from "./utils/utils.js";
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
  const hashedPassword = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
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
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create User",
      error: error,
    });
  }
}

async function signIn(req: Request, res: Response) {
  const { username, password } = req.body;

  const validate = SignInSchema.safeParse({
    username,
    password,
  });

  if (!validate.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: validate.error.flatten(),
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      hashedPassword: true,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid username or password",
    });
  }

  const isPasswordRight = await validatePassoword(
    user.hashedPassword,
    password,
  );

  if (!isPasswordRight) {
    return res.status(401).json({
      message: "Invalid username or password",
    });
  }

  return res.status(200).json({
    message: "Signed in successfully",
  });
}

async function createRoom(req: Request, res: Response) {
  const { slug, adminId } = req.body;

  const validateRoomdata = CreateRoomSchema.safeParse({
    name: slug,
  });

  if (!validateRoomdata.success) {
    return res.status(400).json({
      message: "Invalid input",
      errors: validateRoomdata.error.flatten(),
    });
  }
  try {
    const room = await prisma.room.create({
      data: {
        slug,
        adminId,
      },
    });
    return res.status(200).json({
      message: "Signed in successfully",
      room: room,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create Room",
      error: error,
    });
  }
}
