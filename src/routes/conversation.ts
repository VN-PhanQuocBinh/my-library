import express from "express";
import ConversationController from "../controllers/conversation-controller.ts";
import requireAuth from "../middleware/require-auth.ts";
import requireRole from "../middleware/require-role.ts";
import checkStatusMiddleware from "../middleware/check-status.ts";

const router = express.Router();

const userAuth = [
  requireAuth,
  checkStatusMiddleware,
  requireRole(["reader"]) as express.RequestHandler,
];

router.post("/add-message", ...userAuth, ConversationController.addMessageToConversation);
router.post("/create", ...userAuth, ConversationController.createConversation);
router.get("/list", ...userAuth, ConversationController.getAllConversations);
router.get("/user/:userId", ...userAuth, ConversationController.getConversationsByUserId);
router.patch("/rename/:id", ...userAuth, ConversationController.renameConversation);
router.get("/:id", ...userAuth, ConversationController.getMessagesByConversationId);

export default router;
