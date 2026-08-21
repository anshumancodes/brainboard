import { Router } from "express";
import authMiddleware from "../middlewares/middleware.js";
import {
  createRoom,
  getChats,
  getRoomIdfromSlug,
} from "../controllers/room.controller.js";

const router: Router = Router();

router.post("/create", authMiddleware, createRoom);
router.get("/chats/:roomId", authMiddleware, getChats);
router.get("/slug/:slug", authMiddleware, getRoomIdfromSlug);

export default router;
