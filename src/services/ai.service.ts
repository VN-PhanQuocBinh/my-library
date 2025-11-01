export async function generateEmbeddingWithHuggingFace(prompt: string) {
  try {
    async function query(data: any) {
      const response = await fetch(
        "https://router.huggingface.co/nebius/v1/embeddings",
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
      model: "Qwen/Qwen3-Embedding-8B",
      input: prompt,
    });
    return output.data[0].embedding;
  } catch (error) {
    throw error;
  }
}
