import express from "express";
import adminController from "../../controllers/admin-controller.ts";
const router = express.Router();
import requireAuth from "../../middleware/require-auth.ts";
import requireRole from "../../middleware/require-role.ts";

const userAuth = [requireAuth, requireRole(["manager"]) as express.RequestHandler];

// Route to get all admins
router.get("/list", requireAuth, adminController.getAllAdmins);
router.post("/create", ...userAuth, adminController.createAdmin);
router.patch("/:id", ...userAuth, adminController.updateAdmin);
router.patch("/reset-password/:id", ...userAuth, adminController.changePassword);

export default router;
