import { GoogleGenAI } from "@google/genai";
import type { EmbeddingModelType } from "../config/config.ts";
import embeddingModels from "./embedding.service.ts";

import { InferenceClient } from "@huggingface/inference";

import dotenv from "dotenv";
dotenv.config();
// console.log("HF Token:", process.env.HF_TOKEN);

const client = new InferenceClient(process.env.HF_TOKEN);

const CURRENT_EMBEDDING_MODEL: EmbeddingModelType = "E5Large";
const TEXT_MODEL = "gemini-2.5-flash-lite"; // or "gemini-2.5-flash" -> restart server after change
const googleGenAI = new GoogleGenAI({});

export interface ChatHistory {
  role: "user" | "model";
  parts: { text: string }[];
}

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
  userPrompt: string,
  history: ChatHistory[] = []
) {
  try {
    const chat = await googleGenAI.chats.create({
      model: TEXT_MODEL,
      history: [...history, { role: "model", parts: [{ text: userPrompt }] }],
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

// Test
export async function generateChatResponseV2(
  systemPrompt: string,
  userPrompt: string,
  history: ChatHistory[] = []
) {
  try {
    const chatCompletion = await client.chatCompletion({
      model: "deepseek-ai/DeepSeek-R1:novita",
      tool_prompt: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    return chatCompletion.choices[0]?.message;
  } catch (error) {
    throw error;
  }
}
