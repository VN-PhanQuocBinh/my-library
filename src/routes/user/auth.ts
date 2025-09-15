import express from "express";

const router = express.Router();

import readerAuthController from "../../controllers/reader-auth-controller.ts";

router.post("/register", readerAuthController.register);
router.post("/login", readerAuthController.login);
router.post("/logout", readerAuthController.logout);

export default router;
