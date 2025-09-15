import express from "express";

const router = express.Router();

import adminAuthController from "../../controllers/staff-auth-controller.ts";

router.post("/register", adminAuthController.register);
router.post("/login", adminAuthController.login);
router.post("/logout", adminAuthController.logout);

export default router;
