import type { mongo } from "mongoose";
import type { ISach } from "./sach.ts";

export interface IMessage {
  _id?: string;
  conversationId: mongo.ObjectId;
  role: "user" | "system";
  content: string;
  timestamp: Date;

  data: {
    books?: string[];
  };
}

export interface IConversation {
  _id?: string;
  title: string;
  user: mongo.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export type ConversationType = "SYSTEM_INFO" | "BOOK_RECOMMENDATION";
