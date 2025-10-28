import express from "express";
import { generateResponse } from "../services/aiGenerator.js";
import { scrapeNews } from "../services/scrapers.js";
import { formatResponse } from "../utils/format.js";

const router = express.Router();

router.post("/check", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Scrape news from multiple sources
    const newsData = await scrapeNews(query);

    // Generate AI response
    const aiResponse = await generateResponse(query, newsData);

    // Format the final response
    const formatted = formatResponse(aiResponse, newsData);

    res.json(formatted);
  } catch (error) {
    console.error("Error in /check:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
