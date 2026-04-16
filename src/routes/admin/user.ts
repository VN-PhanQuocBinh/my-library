import express from "express";
import userController from "../../controllers/user-controller";
const router = express.Router();

import requireAuth from "../../middleware/require-auth";
import requireRole from "../../middleware/require-role";

const userAuth = [requireAuth, requireRole(["manager"]) as express.RequestHandler];

// Route to get all users
router.get("/list", requireAuth, userController.getAllUsers);
router.post("/create", ...userAuth, userController.createUser);
router.patch("/:id", ...userAuth, userController.updateUser);
router.patch("/reset-password/:id", ...userAuth, userController.resetPassword);

export default router;
