import requireAuth from "../middleware/require-auth.ts";
import express from "express";

const router = express.Router();

import authController from "../controllers/auth-controller.ts";
router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
