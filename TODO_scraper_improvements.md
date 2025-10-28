# TODO: Improve Scrapers.js for International Article Scraping

## 1. Fix Selector Consistency
- [x] Standardize all sources to use selector arrays instead of single strings
- [x] Update Vietnamese sources to use arrays for consistency

## 2. Improve BBC and International Selectors
- [x] Update BBC selectors for better article extraction
- [x] Refine selectors for Reuters, CNN, AP News to improve accuracy

## 3. Add Additional International Sources
- [x] Add The Guardian as a new international source
- [x] Add Al Jazeera as a new international source
- [x] Ensure new sources have proper selectors and base URLs

## 4. Enhance Anti-Blocking Measures
- [x] Expand user agent list for better rotation
- [x] Add more realistic headers to mimic browser requests
- [x] Implement random delays between requests to avoid rate limiting

## 5. Improve Error Handling and Logging
- [x] Add more detailed logging for scraping attempts and failures
- [x] Enhance retry logic with exponential backoff
- [x] Log successful scrapes with article counts

## 6. Test Scraping Functionality
- [x] Test scraping with international queries (e.g., "Russia Ukraine war")
- [x] Verify BBC and new sources are scraped successfully
- [x] Check for blocking issues and adjust as needed

## 7. Add More Popular International Sources
- [x] Add New York Times
- [x] Add Washington Post
- [x] Add Wall Street Journal
- [x] Add Fox News
- [x] Add NBC News
- [x] Add ABC News
- [x] Add CBS News
- [x] Add NPR
