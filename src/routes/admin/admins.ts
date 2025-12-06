import express from "express";
import adminController from "../../controllers/admin-controller.ts";
const router = express.Router();
import requireAuth from "../../middleware/require-auth.ts";

// Route to get all admins
router.get("/list", requireAuth, adminController.getAllAdmins);
router.post("/create", requireAuth, adminController.createAdmin);
router.patch("/:id", requireAuth, adminController.updateAdmin);
router.patch(
  "/reset-password/:id",
  requireAuth,
  adminController.changePassword
);

export default router;
