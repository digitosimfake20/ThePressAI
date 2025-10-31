import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";

// Function to detect if query is Vietnamese
function isVietnameseQuery(query) {
  // Vietnamese characters and common Vietnamese words
  const vietnamesePattern =
    /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;
  const vietnameseWords = [
    "việt nam",
    "hà nội",
    "sài gòn",
    "đà nẵng",
    "cần thơ",
    "việt",
    "nam",
    "tphcm",
    "bình dương",
    "đồng nai",
    "nghệ an",
    "hải phòng",
  ];

  const lowerQuery = query.toLowerCase();
  return (
    vietnamesePattern.test(query) ||
    vietnameseWords.some((word) => lowerQuery.includes(word))
  );
}

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
];

function randomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function scrapeNews(query) {
  const isVietnamese = isVietnameseQuery(query);

  // Prioritize Vietnamese sources for Vietnamese queries, international for others
  const vietnameseSources = [
    {
      name: "VnExpress",
      url: `https://timkiem.vnexpress.net/?q=${encodeURIComponent(query)}`,
      selectors: [
        ".title-news a",
        ".item-news a[href*='/']",
        "h3.title-news a",
      ],
      baseUrl: "https://vnexpress.net",
      urlProcessor: (href) => {
        if (href.startsWith("http")) return href;
        if (href.startsWith("/")) return `https://vnexpress.net${href}`;
        return `https://vnexpress.net/${href}`;
      },
    },
    {
      name: "Tuoi Tre",
      url: `https://tuoitre.vn/tim-kiem.htm?keywords=${encodeURIComponent(query)}`,
      selectors: [
        ".news-item a[href*='.htm']",
        "h3 a[href*='.htm']",
        ".title a[href*='.htm']",
      ],
      baseUrl: "https://tuoitre.vn",
      urlProcessor: (href) => {
        if (href.startsWith("http")) return href;
        if (href.startsWith("/")) return `https://tuoitre.vn${href}`;
        return `https://tuoitre.vn/${href}`;
      },
    },
    {
      name: "Thanh Nien",
      url: `https://thanhnien.vn/tim-kiem.html?q=${encodeURIComponent(query)}`,
      selectors: [
        ".story__title a",
        ".box-title a[href*='.html']",
        "h2 a[href*='.html']",
      ],
      baseUrl: "https://thanhnien.vn",
      urlProcessor: (href) => {
        if (href.startsWith("http")) return href;
        if (href.startsWith("/")) return `https://thanhnien.vn${href}`;
        return `https://thanhnien.vn/${href}`;
      },
    },
  ];

  const internationalSources = [
    {
      name: "BBC",
      url: `https://www.bbc.com/search?q=${encodeURIComponent(query)}`,
      selectors: [
        ".ssrcss-1mhwnz8-PromoLink a",
        ".ssrcss-1mhwnz8-PromoLink h2 a",
        ".ssrcss-1mhwnz8-PromoLink span a",
        "a[href*='/news/articles/']",
        "a[href*='/news/'] h2",
        "a[href*='/news/'] span",
      ],
      baseUrl: "https://www.bbc.com",
    },
    {
      name: "Reuters",
      url: `https://www.reuters.com/site-search/?query=${encodeURIComponent(query)}`,
      selectors: [
        "a[data-testid='Heading']",
        "a[href*='/world/']",
        "a[href*='/business/']",
        "a[href*='/article/']",
        ".story-content a",
      ],
      baseUrl: "https://www.reuters.com",
    },
    {
      name: "CNN",
      url: `https://edition.cnn.com/search?q=${encodeURIComponent(query)}&size=10`,
      selectors: [
        ".container__headline a",
        ".container__link a",
        "h3 a[href*='/202']",
        ".card--anchor a",
      ],
      baseUrl: "https://edition.cnn.com",
    },
    {
      name: "AP News",
      url: `https://apnews.com/search?q=${encodeURIComponent(query)}`,
      selectors: [
        ".CardHeadline a",
        ".headline a",
        "a[href*='/article/']",
        ".Component-headline-0-2-82 a",
      ],
      baseUrl: "https://apnews.com",
    },
    {
      name: "The Guardian",
      url: `https://www.theguardian.com/search?q=${encodeURIComponent(query)}`,
      selectors: [
        ".fc-item__title a",
        ".fc-item__link",
        "a[href*='/202']",
        ".u-faux-block-link__overlay",
      ],
      baseUrl: "https://www.theguardian.com",
    },
    {
      name: "Al Jazeera",
      url: `https://www.aljazeera.com/search/${encodeURIComponent(query)}`,
      selectors: [
        ".gc__title a",
        ".gc__excerpt a",
        "a[href*='/news/']",
        ".fte__link",
      ],
      baseUrl: "https://www.aljazeera.com",
    },
    {
      name: "New York Times",
      url: `https://www.nytimes.com/search?query=${encodeURIComponent(query)}`,
      selectors: [
        "h4 a[href*='/202']",
        ".css-1l4spti a",
        "a[href*='/202'] h4",
        ".story-link",
        "a[data-testid='search-result-link']",
      ],
      baseUrl: "https://www.nytimes.com",
    },
    {
      name: "Washington Post",
      url: `https://www.washingtonpost.com/search/?query=${encodeURIComponent(query)}`,
      selectors: [
        ".story-headline a",
        ".headline a[href*='/202']",
        "a[data-pb-local-content-field='web_headline']",
        ".font--headline a",
      ],
      baseUrl: "https://www.washingtonpost.com",
    },
    {
      name: "The Wall Street Journal",
      url: `https://www.wsj.com/search?query=${encodeURIComponent(query)}&isToggleOn=true&operator=AND&sort=date-desc&duration=1y&startDate=&endDate=`,
      selectors: [
        "h3 a[href*='/articles/']",
        ".headline a",
        "a[href*='/articles/']",
        ".WSJTheme--headline--unZqjb45 a",
      ],
      baseUrl: "https://www.wsj.com",
    },
    {
      name: "Fox News",
      url: `https://www.foxnews.com/search?q=${encodeURIComponent(query)}&type=story`,
      selectors: [
        ".title a",
        ".headline a[href*='/202']",
        "a[href*='/202']",
        ".article-title a",
      ],
      baseUrl: "https://www.foxnews.com",
    },
    {
      name: "NBC News",
      url: `https://www.nbcnews.com/search/?q=${encodeURIComponent(query)}`,
      selectors: [
        ".tease-card__headline a",
        ".story-card__title a",
        "a[href*='/202'] h2",
        ".headline a",
      ],
      baseUrl: "https://www.nbcnews.com",
    },
    {
      name: "ABC News",
      url: `https://abcnews.go.com/search?searchtext=${encodeURIComponent(query)}`,
      selectors: [
        ".headlines-li a",
        ".headline a[href*='/202']",
        "a[href*='/story/']",
        ".DataListStories h2 a",
      ],
      baseUrl: "https://abcnews.go.com",
    },
    {
      name: "CBS News",
      url: `https://www.cbsnews.com/search/?q=${encodeURIComponent(query)}`,
      selectors: [
        ".item__hed a",
        ".title a[href*='/news/']",
        "a[href*='/news/'] h4",
        ".search-result a",
      ],
      baseUrl: "https://www.cbsnews.com",
    },
    {
      name: "NPR",
      url: `https://www.npr.org/search?query=${encodeURIComponent(query)}`,
      selectors: [
        ".title a",
        ".teaser__text a",
        "a[href*='/202'] h3",
        ".item-info a",
      ],
      baseUrl: "https://www.npr.org",
    },
  ];

  // Choose sources based on query language - REDUCED for faster response
  const sources = isVietnamese
    ? [...vietnameseSources.slice(0, 2), ...internationalSources.slice(0, 1)] // 2 Vietnamese + 1 international = 3 sources
    : [...internationalSources.slice(0, 2), ...vietnameseSources.slice(0, 1)]; // 2 international + 1 Vietnamese = 3 sources

  // Scrape sources in PARALLEL with timeout protection
  const scrapePromises = sources.map(async (source) => {
    try {
      const response = await axios.get(source.url, {
        headers: {
          "User-Agent": randomUserAgent(),
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          Referer: "https://www.google.com/",
        },
        timeout: 5000, // Reduced to 5 seconds
        maxRedirects: 3,
      });

      const $ = cheerio.load(response.data);
      const articles = [];

      for (const sel of source.selectors) {
        $(sel).each((i, el) => {
          if (articles.length >= 3) return false;
          const link = $(el).closest("a").attr("href") || $(el).attr("href");
          const title = $(el).text().trim();
          if (title && link) {
            let fullUrl = link.startsWith("http")
              ? link
              : `${source.baseUrl}${link}`;
            articles.push({ title, url: fullUrl });
          }
        });
        if (articles.length > 0) break;
      }

      console.log(
        `Successfully scraped ${source.name}: ${articles.length} articles`,
      );
      return { source: source.name, articles };
    } catch (error) {
      console.error(`${source.name} failed: ${error.message}`);
      return { source: source.name, articles: [] };
    }
  });

  // Wait for all scraping with a 15-second overall timeout
  const results = await Promise.race([
    Promise.all(scrapePromises),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Scraping timeout")), 15000),
    ),
  ]).catch((error) => {
    console.error("Scraping error:", error.message);
    return [];
  });

  return Array.isArray(results)
    ? results.filter((r) => r.articles.length > 0)
    : [];
}

async function generateResponse(query, newsData) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Limit to 3-5 articles total for faster processing
    const limitedNewsData = newsData
      .flatMap((source) => source.articles)
      .slice(0, 5);

    const sourcesText = newsData
      .map(
        (source) =>
          `${source.source}:\n${source.articles
            .slice(0, 1)
            .map((a) => `- ${a.title}\n  URL: ${a.url}`)
            .join("\n")}`,
      )
      .join("\n\n");

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
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Check if it's a balance issue
    if (
      error.status === 402 ||
      error.message.includes("Insufficient Balance")
    ) {
      console.warn(
        "API balance insufficient, using enhanced fallback response",
      );
      return {
        truth_percentage: "50% true, 50% false",
        verdict: "Unverified - API Balance Issue",
        summary:
          "Unable to verify this information due to API limitations. Please check multiple sources manually.",
        highlights: [
          "API balance exhausted",
          "Manual verification recommended",
        ],
        sources: newsData.flatMap((s) => s.articles).slice(0, 5), // Limit sources in fallback
      };
    }
    // General fallback
    return {
      truth_percentage: "50% true, 50% false",
      verdict: "Unverified",
      summary: "Unable to verify this information at this time.",
      highlights: ["Please check multiple sources"],
      sources: newsData.flatMap((s) => s.articles).slice(0, 5),
    };
  }
}

function formatResponse(aiResponse, newsData) {
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
    sources:
      aiResponse.sources || newsData.flatMap((s) => s.articles).slice(0, 5),
    reliability: reliability,
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const newsData = await scrapeNews(query);
    const aiResponse = await generateResponse(query, newsData);
    const formatted = formatResponse(aiResponse, newsData);

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error in Vercel function:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}
