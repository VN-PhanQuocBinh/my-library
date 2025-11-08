import { GoogleGenAI } from "@google/genai";
import type { EmbeddingModelType } from "../config/config.ts";
import embeddingModels from "./embedding.service.ts";
import dotenv from "dotenv";
dotenv.config();

const CURRENT_EMBEDDING_MODEL: EmbeddingModelType = "E5Large";
const TEXT_MODEL = "gemini-2.0-flash";
const googleGenAI = new GoogleGenAI({});

export async function generateEmbeddingWithHuggingFace(prompt: string) {
  try {
    const output = await embeddingModels[CURRENT_EMBEDDING_MODEL](prompt);
    return output;
  } catch (error) {
    throw error;
  }
}

export async function generateSentenceSimilarity(
  sourceEmbedding: string,
  targetEmbeddings: string[]
) {
  try {
    const response = await embeddingModels["DangVanTuanEmbedding"](
      sourceEmbedding,
      targetEmbeddings
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function generateChatResponse(
  systemPrompt: string,
  userPrompt: string
) {
  try {
    const chat = await googleGenAI.chats.create({
      model: TEXT_MODEL,
      history: [{ role: "model", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const responseText = await chat.sendMessage({ message: userPrompt });
    return responseText.text;
  } catch (error) {
    throw error;
  }
}
