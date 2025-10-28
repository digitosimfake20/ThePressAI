export function formatResponse(aiResponse, newsData) {
  // Calculate reliability percentage from truth_percentage
  let reliability = 50; // default
  if (aiResponse.truth_percentage) {
    const match = aiResponse.truth_percentage.match(/(\d+)%/);
    if (match) {
      reliability = parseInt(match[1]);
    }
  }

  return {
    truth_percentage: aiResponse.truth_percentage || "50% true, 50% false",
    verdict: aiResponse.verdict || "Unverified",
    summary: aiResponse.summary || "Unable to analyze this query.",
    highlights: aiResponse.highlights || [],
    sources: aiResponse.sources || newsData.flatMap(s => s.articles).slice(0, 5),
    reliability: reliability
  };
}
