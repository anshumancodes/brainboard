import { Router } from "express";
import { signIn, signup } from "../controllers/user.controller.js";

const router: Router = Router();

router.post("/signup", signup);
router.post("/signin", signIn);

export default router;
