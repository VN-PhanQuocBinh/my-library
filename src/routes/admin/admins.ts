import express from "express";
import adminController from "../../controllers/admin-controller.ts";
const router = express.Router();

// Route to get all admins
router.get("/list", adminController.getAllAdmins);
router.post("/create", adminController.createAdmin);
router.patch("/:id", adminController.updateAdmin);
router.patch("/reset-password/:id", adminController.changePassword);

export default router;
