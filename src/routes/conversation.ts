import express from "express";
import ConversationController from "../controllers/conversation-controller.ts";

const router = express.Router();

router.get("/:id", ConversationController.getMessagesByConversationId);
router.post("/create", ConversationController.createConversation);
router.post("/add-message", ConversationController.addMessageToConversation);

export default router;
