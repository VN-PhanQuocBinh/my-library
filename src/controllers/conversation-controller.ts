import Conversation from "../models/Conversation.ts";
import Message from "../models/Message.ts";
import type {
  IMessage,
  IConversation,
  ConversationType,
} from "../types/conversation.ts";
import Sach from "../models/Sach.ts";

import aiController from "./ai-controller.ts";

import type { Request, Response } from "express";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../utils/response.ts";
import conversation from "../routes/conversation.ts";

class ConversationController {
  async createConversation(req: Request, res: Response) {
    try {
      const newConversation = new Conversation({
        messages: [],
      });

      if (!newConversation) {
        return res.status(500).json(
          createErrorResponse({
            message: "Failed to create conversation",
          })
        );
      }

      await newConversation.save();
      return res.status(201).json(
        createSuccessResponse({
          message: "Conversation created successfully",
          data: newConversation._id,
          statusCode: 201,
        })
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
      return res.status(500).json(
        createErrorResponse({
          message: "Failed to create conversation",
          statusCode: 500,
          additionalData: error,
        })
      );
    }
  }

  async addMessageToConversation(req: Request, res: Response) {
    try {
      const { conversationId, message, type, data = {} } = req.body;

      if (!message)
        return res.status(400).json(
          createErrorResponse({
            message: "Message content is required",
            statusCode: 400,
          })
        );

      if (!(type === "SYSTEM_INFO" || type === "BOOK_RECOMMENDATION")) {
        return res.status(400).json(
          createErrorResponse({
            message: "Invalid conversation type",
            statusCode: 400,
          })
        );
      }

      const foundConversation = await Conversation.findById(conversationId);
      if (!foundConversation) {
        return res.status(404).json(
          createErrorResponse({
            message: "Conversation not found",
            statusCode: 404,
          })
        );
      }

      // Save user message
      const newUserMessage = new Message();
      newUserMessage.conversationId = conversationId;
      newUserMessage.role = "user";
      newUserMessage.content = message;
      newUserMessage.data = data;
      await newUserMessage.save();

      // Get AI response
      const systemResponse = await aiController.getChatResponse(message);
      const newSystemMessage = new Message();

      newSystemMessage.content = systemResponse
        ? systemResponse
        : "I'm sorry, I couldn't process your request.";
      newSystemMessage.conversationId = conversationId;
      newSystemMessage.role = "system";
      newSystemMessage.data = data;

      await newSystemMessage.save();

      // Get conversation history
      const historyMessages = await Message.find({
        conversationId,
      }).select("role content");

      return res.status(200).json(
        createSuccessResponse({
          message: "Message added to conversation successfully",
          data: historyMessages,
          statusCode: 200,
        })
      );
    } catch (error) {
      console.error("Error adding message to conversation:", error);
      return res.status(500).json(
        createErrorResponse({
          message: "Failed to add message to conversation",
          statusCode: 500,
          additionalData: error,
        })
      );
    }
  }

  async getMessagesByConversationId(req: Request, res: Response) {
    try {
      const { id: conversationId } = req.params;

      const foundConversation = await Conversation.findById(conversationId);

      if (!foundConversation) {
        return res.status(404).json(
          createErrorResponse({
            message: "Conversation not found",
            statusCode: 404,
          })
        );
      }

      const messages = await Message.find({ conversationId }).populate(
        "data.books"
      );

      return res.status(200).json(
        createSuccessResponse({
          message: "Messages retrieved successfully",
          data: {
            conversationId: foundConversation._id,
            messages,
          },
          statusCode: 200,
        })
      );
    } catch (error) {
      console.error("Error retrieving messages:", error);
      return res.status(500).json(
        createErrorResponse({
          message: "Failed to retrieve messages",
          statusCode: 500,
          additionalData: error,
        })
      );
    }
  }
}

export default new ConversationController();
