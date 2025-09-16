import publisherController from "../controllers/publisher-controller.ts";
import express from "express";

const router = express.Router();

router.post("/create", publisherController.createPublisher);
router.get("/list", publisherController.getAllPublishers);
router.patch("/:id", publisherController.updatePublisher);

export default router;
