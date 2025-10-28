import axios from "axios";
import * as cheerio from "cheerio";

// Function to detect if query is Vietnamese
function isVietnameseQuery(query) {
  // Vietnamese characters and common Vietnamese words
  const vietnamesePattern = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;
  const vietnameseWords = ['việt nam', 'hà nội', 'sài gòn', 'đà nẵng', 'cần thơ', 'việt', 'nam', 'tphcm', 'bình dương', 'đồng nai', 'nghệ an', 'hải phòng'];

  const lowerQuery = query.toLowerCase();
  return vietnamesePattern.test(query) || vietnameseWords.some(word => lowerQuery.includes(word));
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

export async function scrapeNews(query) {
  const isVietnamese = isVietnameseQuery(query);

  // Prioritize Vietnamese sources for Vietnamese queries, international for others
  const vietnameseSources = [
    {
      name: "VnExpress",
      url: `https://timkiem.vnexpress.net/?q=${encodeURIComponent(query)}`,
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
      url: `https://tuoitre.vn/tim-kiem.htm?keywords=${encodeURIComponent(query)}`,
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
      url: `https://thanhnien.vn/tim-kiem.html?q=${encodeURIComponent(query)}`,
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
      url: `https://www.bbc.com/search?q=${encodeURIComponent(query)}`,
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
      url: `https://www.reuters.com/site-search/?query=${encodeURIComponent(query)}`,
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
      url: `https://edition.cnn.com/search?q=${encodeURIComponent(query)}&size=10`,
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
      url: `https://apnews.com/search?q=${encodeURIComponent(query)}`,
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
      url: `https://www.theguardian.com/search?q=${encodeURIComponent(query)}`,
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

  // Choose sources based on query language
  const sources = isVietnamese ?
    [...vietnameseSources, ...internationalSources.slice(0, 2)] : // Vietnamese + 2 international
    [...internationalSources.slice(0, 5), ...vietnameseSources.slice(0, 1)];   // 5 international + 1 Vietnamese

  const results = [];

  for (const source of sources) {
    let retries = 3;
    let success = false;
    while (retries > 0 && !success) {
      try {
        // Add random delay to avoid rate limiting (1-3 seconds)
        const delay = Math.floor(Math.random() * 2000) + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

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
          timeout: 15000,
          maxRedirects: 5,
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
          if (articles.length > 0) break; // nếu tìm thấy bài thì dừng selector tiếp theo
        }

        console.log(`Successfully scraped ${source.name}: ${articles.length} articles`);
        results.push({ source: source.name, articles });
        success = true;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error(`${source.name} failed after 3 attempts: ${error.message}`);
          results.push({ source: source.name, articles: [] });
        } else {
          console.warn(`Retry ${source.name}, attempts left: ${retries}`);
          // Exponential backoff: 1s, 2s, 4s
          const backoffDelay = Math.pow(2, 3 - retries) * 1000;
          await new Promise((r) => setTimeout(r, backoffDelay));
        }
      }
    }
  }

  return results.filter((r) => r.articles.length > 0);
}
