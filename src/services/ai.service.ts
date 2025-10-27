import { GoogleGenAI } from "@google/genai";
import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HF_API_KEY);

export async function generateEmbeddingWithHuggingFace(prompt: string) {
  try {
    console.log("key:", process.env.HF_API_KEY);

    const output = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: prompt,
    });

    console.log("Hugging Face embedding output:", output);
    return output;
  } catch (error) {
    console.error("Error embedding with Hugging Face:", error);
    throw error;
  }
}
