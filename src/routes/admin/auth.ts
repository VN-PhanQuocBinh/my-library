import express from "express";
import adminAuthController from "../../controllers/admin-auth-controller.ts";
import requireAuth from "../../middleware/require-auth.ts";

const router = express.Router();

router.post("/register", adminAuthController.register);
router.post("/login", adminAuthController.login);
router.post("/logout", adminAuthController.logout);
router.get("/profile", requireAuth, adminAuthController.getProfile);

export default router;
