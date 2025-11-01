import type { Request, Response } from "express";
import { generateEmbeddingWithHuggingFace } from "../services/ai.service.ts";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../utils/response.ts";

class AIController {
  async generateEmbedding(req: Request, res: Response) {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json(
          createErrorResponse({
            message: "Prompt is required",
            statusCode: 400,
          })
        );
      }

      const embeddingResponse = await generateEmbeddingWithHuggingFace(prompt);
      return res.status(200).json(
        createSuccessResponse({
          message: "Embedding generated successfully",
          data: embeddingResponse,
        })
      );
    } catch (error) {
      console.error("Error generating embedding:", error);
      return res.status(500).json(
        createErrorResponse({
          message: "Failed to generate embedding",
          statusCode: 500,
          additionalData: error,
        })
      );
    }
  }
}

export default new AIController();
