import type { EmbeddingModelType } from "../config/config.ts";

const embeddingModelsLink = [
  "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-large/pipeline/feature-extraction",
  "https://router.huggingface.co/nebius/v1/embeddings",
];

const embeddingModels: Record<
  EmbeddingModelType,
  (prompt: string, options?: any) => Promise<any>
> = {
  Qwen8B: async function (prompt: string) {
    try {
      async function query(data: any) {
        const response = await fetch(embeddingModelsLink[1] as string, {
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
        });
        const result = await response.json();
        return result;
      }

      const output = await query({
        model: "Qwen/Qwen3-Embedding-8B",
        input: prompt,
        provider: "nebius",
      });

      console.log("Embedding output:", output.length);
      return output.data[0].embedding;
    } catch (error) {
      throw error;
    }
  },
  E5Large: async function (prompt: string) {
    try {
      async function query(data: any) {
        const response = await fetch(embeddingModelsLink[0] as string, {
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
        });
        const result = await response.json();
        return result;
      }

      const output = await query({
        inputs: prompt,
      });

      console.log("Embedding output:", output.length);
      return output;
    } catch (error) {
      throw error;
    }
  },
  DangVanTuanEmbedding: async function (source: string, sentences: string[]) {
    try {
      async function query(data: any) {
        const response = await fetch(
          "https://router.huggingface.co/hf-inference/models/dangvantuan/vietnamese-embedding/pipeline/sentence-similarity",
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
        inputs: {
          source_sentence: source,
          sentences,
        },
      });

      return output;
    } catch (error) {
      throw error;
    }
  },
};

export default embeddingModels;
