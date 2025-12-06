import mongoose from "mongoose";
import type { IConversation } from "../types/conversation.ts";

const conversationSchema = new mongoose.Schema<IConversation>(
  {
    title: { type: String, default: "New Conversation" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema,
  "HoiThoai"
);

export default Conversation;
