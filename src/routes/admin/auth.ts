import express from "express";
import adminAuthController from "../../controllers/admin-auth-controller.ts";

const router = express.Router();

router.post("/register", adminAuthController.register);
router.post("/login", adminAuthController.login);
router.post("/logout", adminAuthController.logout);

export default router;
