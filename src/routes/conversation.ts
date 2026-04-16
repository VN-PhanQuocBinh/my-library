import express from "express";
import ConversationController from "../controllers/conversation-controller";
import requireAuth from "../middleware/require-auth";
import requireRole from "../middleware/require-role";
import checkStatusMiddleware from "../middleware/check-status";

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
