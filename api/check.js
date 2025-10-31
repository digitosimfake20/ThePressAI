import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";

// Function to detect if query is Vietnamese (prioritizes diacritics over keywords)
function isVietnameseQuery(query) {
  // Vietnamese characters (diacritics are a strong signal)
  const vietnamesePattern = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;

  // If contains Vietnamese diacritics, it's Vietnamese
  if (vietnamesePattern.test(query)) {
    return true;
  }

  // Only use multi-word Vietnamese phrases to avoid false positives
  const vietnamesePhrases = [
    'việt nam', 'hà nội', 'sài gòn', 'đà nẵng', 'cần thơ', 'tphcm', 
    'bình dương', 'đồng nai', 'nghệ an', 'hải phòng', 'tp hồ chí minh'
  ];

  const lowerQuery = query.toLowerCase();
  return vietnamesePhrases.some(phrase => lowerQuery.includes(phrase));
}

// Function to extract key search terms from long queries
function extractKeyTerms(query) {
  // Remove common question words and filler words
  const fillerWords = [
    'is', 'it', 'true', 'that', 'the', 'a', 'an', 'can', 'you', 'check', 'verify', 'có', 'phải', 'không', 'là', 'được', 'thật', 'sự', 'thế', 'nào', 'như', 'về'
  ];

  // Split into words and filter out short/filler words
  const words = query.toLowerCase().split(/\s+/)
    .filter(word => word.length > 2 && !fillerWords.includes(word));

  // If query is very long (>10 words), take first 5-7 most important words
  if (words.length > 10) {
    return words.slice(0, 7).join(' ');
  }

  // Otherwise use the whole query
  return query;
}

// Detect language more accurately (handles both accented and unaccented Vietnamese)
function detectLanguage(query) {
  const lowerQuery = query.toLowerCase();

  // Count Vietnamese characters (with diacritics)
  const vietnameseChars = (query.match(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/g) || []).length;
  const totalChars = query.replace(/\s/g, '').length;

  // If more than 15% Vietnamese characters with diacritics, it's definitely Vietnamese
  if (totalChars > 0 && (vietnameseChars / totalChars) > 0.15) {
    return 'vi';
  }

  // Vietnamese-specific keywords and phrases
  const vietnameseKeywords = [
    // With accents - place names and institutions
    'việt nam', 'hà nội', 'sài gòn', 'đà nẵng', 'tphcm', 'chính phủ', 'quốc hội', 'thủ tướng',
    'tp hồ chí minh', 'thành phố', 'cần thơ', 'bình dương', 'đồng nai',
    // Without accents - place names and institutions  
    'viet nam', 'ha noi', 'sai gon', 'da nang', 'chinh phu', 'quoc hoi', 'thu tuong',
    'tp ho chi minh', 'thanh pho', 'can tho', 'binh duong', 'dong nai',
    // Common Vietnamese question phrases (unaccented)
    'co phai', 'co that', 'co dung', 'co nen', 'khong phai', 'bao nhieu', 'the nao',
    'tai sao', 'khi nao', 'o dau', 'ra sao', 'nhu the nao', 'la gi',
    // Common Vietnamese words/phrases unlikely in English
    'toi co', 'ban co', 'chung ta', 'chung toi', 'mua nha', 'ban nha',
    'thoi tiet', 'hom nay', 'ngay mai', 'tuan nay', 'thang nay', 'nam nay',
    'nen khong', 'phai khong', 'duoc khong', 'co khong',
    'ban nghi', 'toi nghi', 'hay nhat', 'tot nhat', 'xau nhat'
  ];

  // Check for Vietnamese-specific keywords
  if (vietnameseKeywords.some(word => lowerQuery.includes(word))) {
    return 'vi';
  }

  // Check for common Vietnamese question patterns (unaccented)
  const vietnamesePatterns = [
    /\bco\s+phai\b/,           // có phải
    /\bkhong\s+phai\b/,        // không phải  
    /\bla\s+gi\b/,             // là gì
    /\bnhu\s+the\s+nao\b/,     // như thế nào
    /\bco\s+that\b/,           // có thật
    /\bco\s+dung\b/,           // có đúng
    /\btai\s+sao\b/,           // tại sao
    /\bkhi\s+nao\b/,           // khi nào
    /\bo\s+dau\b/              // ở đâu
  ];

  if (vietnamesePatterns.some(pattern => pattern.test(lowerQuery))) {
    return 'vi';
  }

  // Fallback: use original isVietnameseQuery for additional checks
  if (isVietnameseQuery(query)) {
    return 'vi';
  }

  // Otherwise, default to English
  return 'en';
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

  // Extract key terms for better search results
  const searchTerms = extractKeyTerms(query);
  console.log(`Original query: "${query}"`);
  console.log(`Search terms: "${searchTerms}"`);

  // Prioritize Vietnamese sources for Vietnamese queries, international for others
  const vietnameseSources = [
    {
      name: "VnExpress",
      url: `https://timkiem.vnexpress.net/?q=${encodeURIComponent(searchTerms)}`,
      selectors: [".title-news a", ".item-news a[href*='/']", "h3.title-news a"],
      baseUrl: "https://vnexpress.net",
      urlProcessor: (href) => {
        if (href.startsWith('http')) return href;
        if (href.startsWith('/')) return `https://vnexpress.net${href}`;
        return `https://vnexpress.net/${href}`;
      }
    },
    {
      name: "Tuoi Tre",
      url: `https://tuoitre.vn/tim-kiem.htm?keywords=${encodeURIComponent(searchTerms)}`,
      selectors: [".news-item a[href*='.htm']", "h3 a[href*='.htm']", ".title a[href*='.htm']"],
      baseUrl: "https://tuoitre.vn",
      urlProcessor: (href) => {
        if (href.startsWith('http')) return href;
        if (href.startsWith('/')) return `https://tuoitre.vn${href}`;
        return `https://tuoitre.vn/${href}`;
      }
    },
    {
      name: "Thanh Nien",
      url: `https://thanhnien.vn/tim-kiem.html?q=${encodeURIComponent(searchTerms)}`,
      selectors: [".story__title a", ".box-title a[href*='.html']", "h2 a[href*='.html']"],
      baseUrl: "https://thanhnien.vn",
      urlProcessor: (href) => {
        if (href.startsWith('http')) return href;
        if (href.startsWith('/')) return `https://thanhnien.vn${href}`;
        return `https://thanhnien.vn/${href}`;
      }
    }
  ];

  const internationalSources = [
    {
      name: "BBC",
      url: `https://www.bbc.com/search?q=${encodeURIComponent(searchTerms)}`,
      selectors: [
        ".ssrcss-1mhwnz8-PromoLink a",
        ".ssrcss-1mhwnz8-PromoLink h2 a",
        ".ssrcss-1mhwnz8-PromoLink span a",
        "a[href*='/news/articles/']",
        "a[href*='/news/'] h2",
        "a[href*='/news/'] span"
      ],
      baseUrl: "https://www.bbc.com",
    },
    {
      name: "Reuters",
      url: `https://www.reuters.com/site-search/?query=${encodeURIComponent(searchTerms)}`,
      selectors: [
        "a[data-testid='Heading']",
        "a[href*='/world/']",
        "a[href*='/business/']",
        "a[href*='/article/']",
        ".story-content a"
      ],
      baseUrl: "https://www.reuters.com",
    },
    {
      name: "CNN",
      url: `https://edition.cnn.com/search?q=${encodeURIComponent(searchTerms)}&size=10`,
      selectors: [
        ".container__headline a",
        ".container__link a",
        "h3 a[href*='/202']",
        ".card--anchor a"
      ],
      baseUrl: "https://edition.cnn.com",
    },
    {
      name: "AP News",
      url: `https://apnews.com/search?q=${encodeURIComponent(searchTerms)}`,
      selectors: [
        ".CardHeadline a",
        ".headline a",
        "a[href*='/article/']",
        ".Component-headline-0-2-82 a"
      ],
      baseUrl: "https://apnews.com",
    },
    {
      name: "The Guardian",
      url: `https://www.theguardian.com/search?q=${encodeURIComponent(searchTerms)}`,
      selectors: [
        ".fc-item__title a",
        ".fc-item__link",
        "a[href*='/202']",
        ".u-faux-block-link__overlay"
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
        ".fte__link"
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
        "a[data-testid='search-result-link']"
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
        ".font--headline a"
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
        ".WSJTheme--headline--unZqjb45 a"
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
        ".article-title a"
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
        ".headline a"
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
        ".DataListStories h2 a"
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
        ".search-result a"
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
        ".item-info a"
      ],
      baseUrl: "https://www.npr.org",
    },
  ];

  // Choose sources based on query language - REDUCED for faster response
  const sources = isVietnamese ?
    [...vietnameseSources.slice(0, 2), ...internationalSources.slice(0, 1)] : // 2 Vietnamese + 1 international = 3 sources
    [...internationalSources.slice(0, 2), ...vietnameseSources.slice(0, 1)];   // 2 international + 1 Vietnamese = 3 sources

  // Scrape sources in PARALLEL with timeout protection
  const scrapePromises = sources.map(async (source) => {
    try {
      const response = await axios.get(source.url, {
        headers: {
          "User-Agent": randomUserAgent(),
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Referer": "https://www.google.com/",
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

      console.log(`Successfully scraped ${source.name}: ${articles.length} articles`);
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
      setTimeout(() => reject(new Error('Scraping timeout')), 15000)
    )
  ]).catch(error => {
    console.error('Scraping error:', error.message);
    return [];
  });

  return Array.isArray(results) ? results.filter((r) => r.articles.length > 0) : [];
}

async function generateResponse(query, newsData) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    // Detect query language accurately
    const queryLanguage = detectLanguage(query);
    const languageInstruction = queryLanguage === 'vi' 
      ? 'Vietnamese (Tiếng Việt)' 
      : 'English';

    console.log(`Detected language: ${languageInstruction} for query: "${query}"`);

    // Limit to 3-5 articles total for faster processing
    const limitedNewsData = newsData.flatMap(source => source.articles).slice(0, 5);

    const sourcesText = newsData.map(source =>
      `${source.source}:\n${source.articles.slice(0, 2).map(a => `- ${a.title}\n  URL: ${a.url}`).join('\n')}`
    ).join('\n\n');

    const prompt = `
You are PressAI, a professional news verification assistant. Analyze the query and provide a comprehensive, detailed fact-check response.

🔴 CRITICAL LANGUAGE REQUIREMENT:
The user's query is in ${languageInstruction}.
YOU MUST respond in ${languageInstruction} ONLY for ALL fields (truth_percentage, verdict, summary, highlights).
- If language is Vietnamese → ALL text must be in Vietnamese (Tiếng Việt)
- If language is English → ALL text must be in English
DO NOT MIX LANGUAGES. Match the query language exactly.

User Query: "${query}"

Available News Sources:
${sourcesText}

${newsData.length === 0 ? 'NOTE: No news sources found. Explain that verification is limited without current sources.' : ''}

Task: Provide a comprehensive JSON response with these exact keys:

1. truth_percentage: Percentage assessment (e.g., "85% true, 15% false" OR "85% đúng, 15% sai" in ${languageInstruction})
2. verdict: Choose one and translate to ${languageInstruction}:
   - "Likely True" / "Có thể đúng"
   - "Partially True" / "Một phần đúng"  
   - "False" / "Sai"
   - "Unverified" / "Chưa xác minh"
   - "Misleading" / "Gây hiểu lầm"
   - "Insufficient Information" / "Thiếu thông tin"

3. summary: Write a DETAILED 4-6 sentence analysis in ${languageInstruction} that includes:
   - What the claim states specifically
   - What evidence supports or contradicts it
   - What credible sources report
   - Any important context or nuance
   - Why certain aspects can't be verified (if applicable)
   - Overall assessment with reasoning

4. highlights: Array of 4-6 specific key points in ${languageInstruction}, including:
   - Specific facts from credible sources
   - What can be confirmed vs. what cannot
   - Important context or caveats
   - Date/timeline information if relevant

5. sources: Array of objects with title and url from the sources above
   - ONLY use exact URLs provided above
   - Include sources that are relevant to the query
   - Empty array [] if no sources found or none are relevant

Example Response Format (in ${languageInstruction}):
${queryLanguage === 'vi' ? `{
  "truth_percentage": "75% đúng, 25% chưa xác minh",
  "verdict": "Một phần đúng",
  "summary": "Thông tin về [chủ đề cụ thể] được xác nhận một phần qua nhiều nguồn tin uy tín. Theo báo cáo từ [nguồn], [chi tiết cụ thể] là chính xác và được xác nhận vào [thời gian]. Tuy nhiên, một số chi tiết như [khía cạnh] vẫn chưa có đủ bằng chứng để xác minh hoàn toàn. Các nguồn tin quốc tế như [nguồn] cũng đưa tin tương tự nhưng với một số khác biệt nhỏ về [chi tiết]. Nhìn chung, phần lớn thông tin là đáng tin cậy nhưng cần thận trọng với các chi tiết chưa được xác nhận.",
  "highlights": [
    "Nguồn [tên nguồn] xác nhận [sự kiện cụ thể] vào ngày [ngày tháng]",
    "Nhiều báo uy tín đồng thuận về [khía cạnh chính]",
    "Chi tiết về [phần cụ thể] chưa được xác minh đầy đủ",
    "Bối cảnh quan trọng: [thông tin bối cảnh]",
    "Cần thêm nguồn tin để xác nhận [khía cạnh còn thiếu]"
  ],
  "sources": [...]
}` : `{
  "truth_percentage": "75% true, 25% unverified",
  "verdict": "Partially True",
  "summary": "The claim regarding [specific subject] has been partially confirmed through multiple credible sources. According to reports from [source], [specific detail] is accurate and was confirmed on [date]. However, certain details such as [aspect] lack sufficient evidence for complete verification. International sources like [source] also report similar information but with minor differences regarding [detail]. Overall, most of the information appears reliable, but caution is warranted for unconfirmed specifics. The context suggests [important contextual information].",
  "highlights": [
    "Source [source name] confirmed [specific event] on [date]",
    "Multiple reputable outlets agree on [main aspect]",
    "Details about [specific part] remain unverified",
    "Important context: [contextual information]",
    "Additional sources needed to confirm [missing aspect]",
    "Timeline matches [verification point]"
  ],
  "sources": [...]
}`}

IMPORTANT RULES:
- Write ALL text in ${languageInstruction} only
- Be specific with facts, dates, and source names
- Explain WHY something cannot be verified if that's the case
- Make summary 4-6 sentences minimum for thorough analysis
- Do not fabricate information or URLs
- Return ONLY valid JSON, no markdown blocks

Generate the response now:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error("AI Generation Error:", error);
    const lang = detectLanguage(query);

    // Check if it's a balance issue
    if (error.status === 402 || error.message.includes('Insufficient Balance')) {
      console.warn("API balance insufficient, using enhanced fallback response");
      return lang === 'vi' ? {
        truth_percentage: "50% đúng, 50% sai",
        verdict: "Chưa xác minh - Vấn đề API",
        summary: "Không thể xác minh thông tin này do hạn chế của API. Vui lòng kiểm tra nhiều nguồn tin khác nhau một cách thủ công để xác nhận thông tin.",
        highlights: ["API hết hạn mức", "Khuyến nghị xác minh thủ công"],
        sources: newsData.flatMap(s => s.articles).slice(0, 5)
      } : {
        truth_percentage: "50% true, 50% false",
        verdict: "Unverified - API Balance Issue",
        summary: "Unable to verify this information due to API limitations. Please check multiple sources manually to confirm the information.",
        highlights: ["API balance exhausted", "Manual verification recommended"],
        sources: newsData.flatMap(s => s.articles).slice(0, 5)
      };
    }

    // General fallback
    return lang === 'vi' ? {
      truth_percentage: "50% đúng, 50% sai",
      verdict: "Chưa xác minh",
      summary: "Không thể xác minh thông tin này tại thời điểm hiện tại. Hệ thống không tìm thấy đủ nguồn tin đáng tin cậy để đưa ra đánh giá chính xác.",
      highlights: ["Vui lòng kiểm tra nhiều nguồn tin khác nhau"],
      sources: newsData.flatMap(s => s.articles).slice(0, 5)
    } : {
      truth_percentage: "50% true, 50% false",
      verdict: "Unverified",
      summary: "Unable to verify this information at this time. The system could not find sufficient credible sources to provide an accurate assessment.",
      highlights: ["Please check multiple sources for verification"],
      sources: newsData.flatMap(s => s.articles).slice(0, 5)
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
    sources: aiResponse.sources || newsData.flatMap(s => s.articles).slice(0, 5),
    reliability: reliability
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const newsData = await scrapeNews(query);
    const aiResponse = await generateResponse(query, newsData);
    const formatted = formatResponse(aiResponse, newsData);

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error in Vercel function:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
