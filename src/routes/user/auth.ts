import express from "express";

const router = express.Router();
import requireAuth from "../../middleware/require-auth.ts";

import readerAuthController from "../../controllers/user-auth-controller.ts";

router.post("/register", readerAuthController.register);
router.post("/login", readerAuthController.login);
router.post("/logout", readerAuthController.logout);
router.get("/profile", requireAuth, readerAuthController.getProfile);
router.patch("/profile/:id", requireAuth, readerAuthController.updateProfile);

export default router;
