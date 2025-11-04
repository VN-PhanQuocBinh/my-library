import { GoogleGenAI } from "@google/genai";

const AI_MODEL = "gemini-2.0-flash";

const ai = new GoogleGenAI({});

export async function generateEmbeddingWithHuggingFace(prompt: string) {
  try {
    async function query(data: any) {
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-large/pipeline/feature-extraction",
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      return result;
    }

    const output = await query({
      // model: "multilingual-e5-large",
      inputs: prompt,
    });

    console.log("Embedding output:", output.length);
    return output;
  } catch (error) {
    throw error;
  }
}

export async function generateChatResponse(
  systemPrompt: string,
  userPrompt: string
) {
  try {
    const chat = await ai.chats.create({
      model: AI_MODEL,
      history: [{ role: "user", parts: [{ text: userPrompt }] }],
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
