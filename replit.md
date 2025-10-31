# PressAI - AI-Powered News Verification

## Overview
PressAI is an AI-powered news verification application that helps users fact-check news articles and information. The application scrapes multiple news sources (both Vietnamese and international), analyzes them using OpenAI's GPT-4, and provides detailed fact-checking responses with reliability scores.

## Recent Changes (October 31, 2025)
- Configured for Replit environment
- Updated frontend to run on port 5000 with 0.0.0.0 binding
- Updated backend to run on port 3001 in development (localhost), port 5000 in production (0.0.0.0)
- Changed API calls from Netlify functions to local backend API (http://localhost:3001/api/check)
- Added OPENAI_API_KEY environment variable configuration
- Installed all dependencies (npm install)
- Set up concurrently to run both frontend and backend together
- Configured deployment to build React app and serve via backend in production
- Created .env.local for React development configuration
- Updated backend/server.js to serve static React build in production mode

## Project Architecture

### Frontend (React)
- **Port**: 5000
- **Host**: 0.0.0.0 (to work with Replit proxy)
- **Location**: `src/`
- **Main Components**:
  - `LandingPage.jsx` - Initial landing page with search input
  - `ChatPage.jsx` - Chat interface for news verification
  - Uses Framer Motion for animations
  - Speech recognition support (Vietnamese)

### Backend (Express.js)
- **Port**: 3001
- **Host**: localhost
- **Location**: `backend/`
- **Main Components**:
  - `server.js` - Express server setup
  - `routes/ai.js` - API routes for news checking
  - `services/aiGenerator.js` - OpenAI integration for analysis
  - `services/scrapers.js` - Web scraping for news sources
  - `utils/format.js` - Response formatting

### API Endpoints
- `POST /api/check` - Main endpoint for news verification
  - Accepts: `{ query: string }`
  - Returns: Structured verification response with reliability score, verdict, summary, highlights, and sources

### News Sources
**Vietnamese Sources**:
- VnExpress
- Tuoi Tre
- Thanh Nien

**International Sources**:
- BBC
- Reuters
- CNN

## Environment Variables
- `OPENAI_API_KEY` - Required for AI-powered analysis (stored in Replit Secrets)
- `PORT` - Frontend port (5000)
- `HOST` - Frontend host (0.0.0.0)
- Backend uses port 3001 by default

## Running the Application
The application runs both frontend and backend concurrently:
```bash
npm run dev
```

This starts:
1. React development server on 0.0.0.0:5000
2. Express backend server on localhost:3001

## Features
1. **Multi-source News Scraping** - Fetches articles from multiple credible sources
2. **AI Analysis** - Uses GPT-4 to analyze and fact-check information
3. **Reliability Scoring** - Provides percentage-based reliability assessment
4. **Multi-language Support** - Responds in the same language as the query (Vietnamese/English)
5. **Detailed Breakdowns** - Shows highlights, summary, and source links
6. **Interactive UI** - Modern, animated interface with chat history sidebar

## User Preferences
- No specific preferences documented yet

## Notes
- The chat history sidebar is currently non-functional (marked as "HIỆN TẠI CHƯA HOẠT ĐỘNG ĐƯỢC")
- The application uses web scraping which may be affected by website structure changes
- OpenAI API usage may incur costs based on query volume
