import {
  generateEmbeddingWithHuggingFace,
  generateChatResponse,
} from "../services/ai.service.ts";

class AIController {
  async generateEmbedding(prompt: string) {
    try {
      if (!prompt) {
        throw new Error("Prompt is required");
      }

      const embeddingResponse = await generateEmbeddingWithHuggingFace(prompt);
      return embeddingResponse;
    } catch (error) {
      throw new Error("Failed to generate embedding");
    }
  }

  async getChatResponse(prompt: string) {
    try {
      if (!prompt) {
        throw new Error("Prompt is required");
      }

      const systemPrompt = [
        "Bạn là Chatbot Thư viện thông minh, thân thiện.",
        "Hãy trả lời câu hỏi của người dùng và tạo ra một đoạn văn bản tự nhiên, lịch sự để giới thiệu TỐI ĐA 5 cuốn sách đã được gợi ý dưới đây.",
        "Tuyệt đối không nhắc đến 'score' hay 'điểm phù hợp'.",
      ].join(" ");

      const chatResponse = await generateChatResponse(systemPrompt, prompt);
      return chatResponse;
    } catch (error) {
      throw new Error("Failed to generate chat response");
    }
  }
}

export default new AIController();
