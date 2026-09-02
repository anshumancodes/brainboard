import { Router } from "express";
import authMiddleware from "../middlewares/middleware.js";
import {
  createRoom,
  getRoomIdfromSlug,
  getMyRooms,
  deleteRoom,
  getShapes,
  deleteShape,
} from "../controllers/room.controller.js";

const router: Router = Router();

router.post("/create", authMiddleware, createRoom);
router.get("/my-rooms", authMiddleware, getMyRooms);
router.get("/shapes/:roomId", authMiddleware, getShapes);
router.delete("/shapes/:shapeId", authMiddleware, deleteShape);
router.get("/slug/:slug", authMiddleware, getRoomIdfromSlug);
router.delete("/:id", authMiddleware, deleteRoom);

export default router;
