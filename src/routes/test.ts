import aiController from "../controllers/ai-controller.ts";
import express from "express";
const router = express.Router();

router.get("/embedding", async (req, res) => {
  try {
    const prompt = req.body.prompt as string;
    const embedding = await aiController.generateEmbedding(prompt);
    res.status(200).json({ dimension: embedding.length, embedding });
  } catch (error) {
    console.error("Error generating embedding:", error);
    res.status(500).json({ error: "Failed to generate embedding" });
  }
});

router.get("/similarity", async (req, res) => {
  try {
    const source = req.body.source as string;
    const sentences = req.body.sentences as string[];

    const similarity = await aiController.getSentenceSimilarity(
      source,
      sentences
    );

    const averageScores =
      similarity.reduce((a: number, b: number) => a + b, 0) / similarity.length;
    res.status(200).json({ averageScores, similarity });
  } catch (error) {
    console.error("Error getting sentence similarity:", error);
    res.status(500).json({ error: "Failed to get sentence similarity" });
  }
});

router.get("/chat", async (req, res) => {
  try {
    const prompt = req.body.prompt as string;

    console.log(process.env.GEMINI_API_KEY);
    const chatResponse = await aiController.getChatResponse(prompt);
    res.status(200).json({ response: chatResponse });
  } catch (error) {
    console.error("Error getting chat response:", error);
    res.status(500).json({ error });
  }
});

export default router;
