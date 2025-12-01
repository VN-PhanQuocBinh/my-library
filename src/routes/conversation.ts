import express from "express";
import ConversationController from "../controllers/conversation-controller.ts";

const router = express.Router();

router.post("/add-message", ConversationController.addMessageToConversation);
router.post("/create", ConversationController.createConversation);
router.get("/list", ConversationController.getAllConversations);
router.get("/user/:userId", ConversationController.getConversationsByUserId);
router.patch("/rename/:id", ConversationController.renameConversation);
router.get("/:id", ConversationController.getMessagesByConversationId);

export default router;
