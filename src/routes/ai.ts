import express from "express";
import AIController from "../controllers/ai-controller.ts";

const router = express.Router();

router.get("/embedding", AIController.generateEmbedding);
export default router;
