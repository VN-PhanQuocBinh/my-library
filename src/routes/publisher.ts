import publisherController from "../controllers/publisher-controller.ts";
import express from "express";
import requireAuth from "../middleware/require-auth.ts";
import requireRole from "../middleware/require-role.ts";

const router = express.Router();

router.post(
  "/create",
  requireAuth,
  requireRole(["manager"]) as express.RequestHandler,
  publisherController.createPublisher
);

router.get("/list", requireAuth, publisherController.getAllPublishers);

router.patch(
  "/:id",
  requireAuth,
  requireRole(["manager"]) as express.RequestHandler,
  publisherController.updatePublisher
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["manager"]) as express.RequestHandler,
  publisherController.deletePublisher
);

export default router;
