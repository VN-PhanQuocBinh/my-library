import {
  generateEmbeddingWithHuggingFace,
  generateSentenceSimilarity,
  generateChatResponse,
} from "../services/ai.service.ts";

import type { IMessage } from "../types/conversation.ts";
import type { ChatHistory } from "../services/ai.service.ts";

import { SYSTEM_PROMPT } from "../data/system-prompt.ts";

class AIController {
  // Generate embedding for a given prompt
  async generateEmbedding(prompt: string) {
    try {
      if (!prompt) {
        throw new Error("Prompt is required");
      }

      const embeddingResponse = await generateEmbeddingWithHuggingFace(prompt);
      return embeddingResponse;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  // Get similarity score between a source sentence and an array of sentences
  async getSentenceSimilarity(source: string, sentences: string[]) {
    try {
      if (!source || sentences.length === 0) {
        throw new Error("Source and sentences are required");
      }

      const similarityResponse = await generateSentenceSimilarity(
        source,
        sentences
      );
      return similarityResponse;
    } catch (error) {
      throw new Error("Failed to get sentence similarity");
    }
  }

  // Generate chat response based on prompt and chat history
  async getChatResponse(prompt: string, history: IMessage[] = []) {
    try {
      if (!prompt) {
        throw new Error("Prompt is required");
      }

      const formattedHistory: ChatHistory[] = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const chatResponse = await generateChatResponse(
        SYSTEM_PROMPT,
        prompt,
        formattedHistory
      );
      return chatResponse;
    } catch (error) {
      throw error;
    }
  }
}

export default new AIController();
