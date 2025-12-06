import mongoose from "mongoose";
import Sach from "./Sach.ts";
import type { ISach } from "../types/sach.ts";
import type { IMessage } from "../types/conversation.ts";

const messageSchema = new mongoose.Schema<IMessage>(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    role: { type: String, enum: ["user", "system"], required: true },
    content: { type: String, required: true },
    data: {
      books: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Sach",
        },
      ],
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema, "TinNhan");

export default Message;
