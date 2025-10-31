import { scrapeNews } from './services/scrapers.js';

async function testScraping() {
  console.log('Testing scraping functionality...');
  try {
    const results = await scrapeNews('Donald Trump bị ám sát'); // Nội dung muốn scrap
    console.log('Scraping results:');
    results.forEach(source => {
      console.log(`${source.source}: ${source.articles.length} articles`);
      source.articles.forEach(article => {
        console.log(`  - ${article.title}`);
        console.log(`    URL: ${article.url}`);
      });
    });
  } catch (error) {
    console.error('Scraping test failed:', error);
  }
}

testScraping();
