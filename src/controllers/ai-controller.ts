import {
  generateEmbeddingWithHuggingFace,
  generateSentenceSimilarity,
  generateChatResponse,
} from "../services/ai.service.ts";

const systemPrompt = [
  "Bạn là Chatbot Thư viện thông minh, thân thiện.",
  "Hãy trả lời câu hỏi của người dùng và tạo ra một đoạn văn bản tự nhiên.",
  "Nội dung văn bản (responseText) phải sử dụng định dạng Markdown (ví dụ: **in đậm**, dấu `*` hoặc `1.` cho danh sách) để văn bản dễ đọc và có cấu trúc.",
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

  async getChatResponse(prompt: string) {
    try {
      if (!prompt) {
        throw new Error("Prompt is required");
      }

      const chatResponse = await generateChatResponse(systemPrompt, prompt);
      return chatResponse;
    } catch (error) {
      throw error;
    }
  }
}

export default new AIController();
