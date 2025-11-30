import express from "express";
import ConversationController from "../controllers/conversation-controller.ts";

const router = express.Router();

router.post("/add-message", ConversationController.addMessageToConversation);
router.post("/create", ConversationController.createConversation);
router.get("/user/:userId", ConversationController.getConversationsByUserId);
router.get("/:id", ConversationController.getMessagesByConversationId);

export default router;
