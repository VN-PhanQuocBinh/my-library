import requireAuth from "../middleware/require-auth.ts";
import express from "express";

const router = express.Router();

import authController from "../controllers/reader-auth-controller.ts";

// router.post("/reader/login", authController.)

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

export default router;
