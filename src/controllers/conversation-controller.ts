import Conversation from "../models/Conversation.ts";
import Message from "../models/Message.ts";
import Sach from "../models/Sach.ts";
import aiController from "./ai-controller.ts";
import type { Request, Response } from "express";
import { createSuccessResponse, createErrorResponse } from "../utils/response.ts";
import { BOOK_EMBEDDING_CONFIG } from "../config/config.ts";
import { SUGGESTION_PROMPT, LIBRARY_FAQ_CONTENT } from "../data/system-prompt.ts";
import { set } from "mongoose";

const MAX_MESSAGE_HISTORY = 10;

class ConversationController {
  async getConversationsByUserId(req: Request, res: Response) {
    try {
      // const userId = req.params.userId;
      console.log("User info:", req.user);

      const conversations = await Conversation.find({ user: req.user?._id });

      return res.status(200).json(
        createSuccessResponse({
          message: "Conversations retrieved successfully",
          data: conversations,
          statusCode: 200,
        })
      );
    } catch (error) {
      console.error("Error retrieving conversations:", error);
      return res.status(500).json(
        createErrorResponse({
          message: "Failed to retrieve conversations",
          statusCode: 500,
          additionalData: error,
        })
      );
    }
  }

  async createConversation(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      console.log("Creating conversation for userId:", req.user);

      if (!userId) {
        return res.status(400).json(
          createErrorResponse({
            message: "User ID is required",
            statusCode: 400,
          })
        );
      }

      const newConversation = new Conversation({
        messages: [],
        user: userId,
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
          data: newConversation,
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

      let rankedBooks: Record<string, string>[] = [];
      let systemContextPrompt = "";

      // Handle conversation types
      switch (type) {
        case "SYSTEM_INFO": {
          systemContextPrompt = LIBRARY_FAQ_CONTENT;
          break;
        }

        case "BOOK_RECOMMENDATION": {
          const promptEmbedding = await aiController.generateEmbedding(message);
          if (!promptEmbedding) {
            return res.status(404).json(
              createErrorResponse({
                message: "No books available for recommendation",
                statusCode: 404,
              })
            );
          }

          const pipeline = [
            {
              $vectorSearch: {
                queryVector: promptEmbedding,
                index: BOOK_EMBEDDING_CONFIG.SEARCH_INDEX_NAME,
                path: BOOK_EMBEDDING_CONFIG.PATH,
                numCandidates: BOOK_EMBEDDING_CONFIG.NUMBER_CANDIDATES, // The number of candidates to consider for vector search
                limit: BOOK_EMBEDDING_CONFIG.LIMIT, // The number of results to return
              },
            },

            // Optionally, project the fields you want to return
            {
              $project: {
                _id: 1,
                name: 1,
                author: 1,
                description: 1,
                coverImage: 1,
                score: { $meta: "vectorSearchScore" },
              },
            },
          ];
          const recommendedBooks = await Sach.aggregate(pipeline);
          const averageScores =
            recommendedBooks.reduce((acc, book) => acc + book.score, 0) / recommendedBooks.length; // Since we are using vector search score directly

          // Store books with similarity score above average
          recommendedBooks.forEach((book, index) => {
            if (book.score >= averageScores && book.score > 0) {
              // Add score to passed book object
              const passedBook = recommendedBooks[index];
              passedBook.score = book.score;
              rankedBooks.push(passedBook);
            }
          });

          rankedBooks = rankedBooks.sort((a: any, b: any) => b.score - a.score);
          const contextData = rankedBooks
            .map(
              (book, index) =>
                `${index + 1}. Tên: ${book.name}, Tác giả: ${book.author}, Mô tả: ${
                  book.description
                }`
            )
            .join("\n");

          // Prepare system prompt with context data
          systemContextPrompt = `
            ${SUGGESTION_PROMPT}

            [DỮ LIỆU ĐẦU VÀO]
            Dưới đây là danh sách các cuốn sách liên quan nhất đã được tìm thấy dựa trên truy vấn của người dùng.
            ${contextData}
          `;
          break;
        }

        default: {
          return res.status(400).json(
            createErrorResponse({
              message: "Invalid conversation type",
              statusCode: 400,
            })
          );
        }
      }

      // Get AI response and save system message
      const finalPrompt = `
        ${systemContextPrompt}

        [TRUY VẤN CỦA NGƯỜI DÙNG]
        ${message}
      `;

      // Retrieve recent chat history
      const chatHistory = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(MAX_MESSAGE_HISTORY);

      // Get AI response
      const systemResponse = await aiController.getChatResponse(finalPrompt, chatHistory);

      // Save system message
      const newSystemMessage = new Message();

      newSystemMessage.content = systemResponse
        ? systemResponse
        : "I'm sorry, I couldn't process your request.";
      newSystemMessage.conversationId = conversationId;
      newSystemMessage.role = "system";

      newSystemMessage.data.books = rankedBooks.map((book) => book._id as string) || [];
      await newSystemMessage.save();

      return res.status(200).json(
        createSuccessResponse({
          message: "Message added to conversation successfully",
          data: {
            ...newSystemMessage.toObject(),
            data: {
              books: rankedBooks,
            },
          },
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

      const messages = await Message.find({ conversationId }).populate("data.books");

      return res.status(200).json(
        createSuccessResponse({
          message: "Messages retrieved successfully",
          data: {
            ...foundConversation.toObject(),
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

  async getAllConversations(req: Request, res: Response) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(400).json(
          createErrorResponse({
            message: "User ID is required",
            statusCode: 400,
          })
        );
      }

      const conversations = await Conversation.find({ user: userId });

      return res.status(200).json(
        createSuccessResponse({
          message: "All conversations retrieved successfully",
          data: conversations,
          statusCode: 200,
        })
      );
    } catch (error) {
      console.error("Error retrieving all conversations:", error);
      return res.status(500).json(
        createErrorResponse({
          message: "Failed to retrieve all conversations",
          statusCode: 500,
          additionalData: error,
        })
      );
    }
  }

  async renameConversation(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      const { newTitle } = req.body;
      const { id: conversationId } = req.params;

      if (!userId) {
        return res.status(400).json(
          createErrorResponse({
            message: "User ID is required",
            statusCode: 400,
          })
        );
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId,
      });

      if (!conversation) {
        return res.status(404).json(
          createErrorResponse({
            message: "Conversation not found",
            statusCode: 404,
          })
        );
      }

      conversation.title = newTitle;
      await conversation.save();

      return res.status(200).json(
        createSuccessResponse({
          message: "Conversation renamed successfully",
          data: conversation,
          statusCode: 200,
        })
      );
    } catch (error) {
      console.error("Error renaming conversation:", error);
      return res.status(500).json(
        createErrorResponse({
          message: "Failed to rename conversation",
          statusCode: 500,
          additionalData: error,
        })
      );
    }
  }
}

export default new ConversationController();
