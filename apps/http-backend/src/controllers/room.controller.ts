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


async function getRoomIdfromSlug(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);

    const room = await prisma.room.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    return res.status(200).json({
      roomId: room.id,
    });
  } catch (error) {
    console.error("Failed to get room ID:", error);

    return res.status(500).json({
      message: "Failed to get room ID",
    });
  }
}

async function getMyRooms(req: Request, res: Response) {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        adminId: req.userId!,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({ rooms });
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return res.status(500).json({ message: "Failed to fetch rooms" });
  }
}

async function deleteRoom(req: Request, res: Response) {
  try {
    const roomId = Number(req.params.id);

    if (isNaN(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.adminId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: you do not own this room" });
    }

    await prisma.shape.deleteMany({ where: { roomId } });
    await prisma.room.delete({ where: { id: roomId } });

    return res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Failed to delete room:", error);
    return res.status(500).json({ message: "Failed to delete room" });
  }
}

async function getShapes(req: Request, res: Response) {
  try {
    const roomId = Number(req.params.roomId);

    if (isNaN(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const shapes = await prisma.shape.findMany({
      where: { roomId },
      orderBy: { id: "asc" },
    });

    return res.status(200).json({ shapes });
  } catch (error) {
    console.error("Failed to fetch shapes:", error);
    return res.status(500).json({ message: "Failed to fetch shapes" });
  }
}

async function deleteShape(req: Request, res: Response) {
  try {
    const shapeId = Number(req.params.shapeId);

    if (isNaN(shapeId)) {
      return res.status(400).json({ message: "Invalid shape ID" });
    }

    // Verify the shape exists and belongs to a room the requester can access
    const shape = await prisma.shape.findUnique({
      where: { id: shapeId },
      include: { room: true },
    });

    if (!shape) {
      return res.status(404).json({ message: "Shape not found" });
    }

    await prisma.shape.delete({ where: { id: shapeId } });

    return res.status(200).json({ message: "Shape deleted successfully" });
  } catch (error) {
    console.error("Failed to delete shape:", error);
    return res.status(500).json({ message: "Failed to delete shape" });
  }
}

export { createRoom, getRoomIdfromSlug, getMyRooms, deleteRoom, getShapes, deleteShape };
