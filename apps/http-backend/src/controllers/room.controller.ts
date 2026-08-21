import { CreateRoomSchema } from "@repo/common/types";
import type { Request, Response } from "express";

import { prisma } from "@repo/database";

async function createRoom(req: Request, res: Response) {
  const { slug } = req.body;

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
        adminId: req.userId!,
      },
    });
    return res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create Room",
    });
  }
}

async function getChats(req: Request, res: Response) {
  try {
    const roomId = Number(req.params.roomId);
    const messages = await prisma.chat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        id: "desc",
      },
      take: 50,
    });
    return res.status(201).json({
      messages: messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error,
      message: "cant fetch messages",
    });
  }
}

export { createRoom, getChats };
