import {
  generateEmbeddingWithHuggingFace,
  generateChatResponse,
} from "../services/ai.service.ts";

const systemPrompt = [
  "Bạn là Chatbot Thư viện thông minh, thân thiện.",
  "Hãy trả lời câu hỏi của người dùng và tạo ra một đoạn văn bản tự nhiên, lịch sự để giới thiệu TỐI ĐA 5 cuốn sách đã được gợi ý dưới đây.",
  "Tuyệt đối không nhắc đến 'score' hay 'điểm phù hợp'.",
  "Sử dụng ngôn ngữ theo ngôn ngữ của người dùng.",
].join(" ");

class AIController {
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

  async getChatResponse(prompt: string) {
    try {
      if (!prompt) {
        throw new Error("Prompt is required");
      }

      const chatResponse = await generateChatResponse(systemPrompt, prompt);
      return chatResponse;
    } catch (error) {
      throw new Error("Failed to generate chat response");
    }
  }
}

export default new AIController();
