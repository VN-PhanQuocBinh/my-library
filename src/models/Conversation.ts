import mongoose from "mongoose";
import type { IConversation } from "../types/conversation.ts";

const conversationSchema = new mongoose.Schema<IConversation>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema,
  "Conversation"
);

export default Conversation;
