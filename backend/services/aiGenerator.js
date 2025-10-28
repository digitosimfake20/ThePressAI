import OpenAI from "openai";

export async function generateResponse(query, newsData) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    // Limit to 3-5 articles total for faster processing
    const limitedNewsData = newsData.flatMap(source => source.articles).slice(0, 5);

    const sourcesText = newsData.map(source =>
      `${source.source}:\n${source.articles.slice(0, 1).map(a => `- ${a.title}\n  URL: ${a.url}`).join('\n')}`
    ).join('\n\n');

    const prompt = `
You are PressAI, a news verification assistant. Analyze the following news query and provide a detailed fact-check response.

CRITICAL LANGUAGE INSTRUCTION: First, detect the language of the user's query ("${query}"). Then, provide the ENTIRE response (truth_percentage, verdict, summary, highlights, sources) in that EXACT SAME LANGUAGE. Do not use English if the query is in Vietnamese. Do not use Vietnamese if the query is in English. Respond in the detected language for all text fields.

Query: "${query}"

Available news sources:
${sourcesText}

Please provide a comprehensive JSON response with these exact keys: truth_percentage, verdict, summary, highlights (array), sources (array of objects with title and url)

Requirements:
- truth_percentage: Assessment as percentages (e.g., "85% true, 15% false" or "85% đúng, 15% sai" depending on language)
- verdict: One of "Likely True", "False", "Unverified", "Partially True" (translate to detected language)
- summary: Detailed 2-3 sentence explanation of findings with specific facts (in detected language)
- highlights: Array of 3-5 key points from the analysis (in detected language)
- sources: Array of objects with title and url - ONLY include sources that directly support the verdict (empty array if no supporting sources)

IMPORTANT: Only include URLs that are valid, working, and directly related to the query. Do not fabricate, modify, or use placeholder URLs. You MUST use the exact URLs provided in the sources above. If no valid sources support the claim, return empty sources array.

Example format (adapt language based on query):
{
  "truth_percentage": "85% true, 15% false",
  "verdict": "Likely True",
  "summary": "The claim about [specific fact] appears largely accurate based on multiple sources. Recent reports from [source] confirm [detail], while [source] provides additional context about [aspect]. However, some details may be exaggerated.",
  "highlights": [
    "Multiple credible sources confirm the core facts",
    "Recent developments support the timeline mentioned",
    "Some secondary details remain unverified"
  ],
  "sources": [
    {"title": "Breaking: Major Event Confirmed", "url": "https://realsource.com/article123"},
    {"title": "Official Statement Released", "url": "https://officialsource.com/press-release"}
  ]
}

Return only valid JSON, no markdown or code blocks.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Check if it's a balance issue
    if (error.status === 402 || error.message.includes('Insufficient Balance')) {
      console.warn("API balance insufficient, using enhanced fallback response");
      return {
        truth_percentage: "50% true, 50% false",
        verdict: "Unverified - API Balance Issue",
        summary: "Unable to verify this information due to API limitations. Please check multiple sources manually.",
        highlights: ["API balance exhausted", "Manual verification recommended"],
        sources: newsData.flatMap(s => s.articles).slice(0, 5) // Limit sources in fallback
      };
    }
    // General fallback
    return {
      truth_percentage: "50% true, 50% false",
      verdict: "Unverified",
      summary: "Unable to verify this information at this time.",
      highlights: ["Please check multiple sources"],
      sources: newsData.flatMap(s => s.articles).slice(0, 5)
    };
  }
}
