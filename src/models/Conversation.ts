import mongoose from "mongoose";
import type { IConversation, IMessage } from "../types/conversation.ts";
import Message from "./Message.ts";

const conversationSchema = new mongoose.Schema<IConversation>(
  {},
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
