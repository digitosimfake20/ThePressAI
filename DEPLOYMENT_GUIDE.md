# PressAI Deployment Guide

This guide covers deployment to both **Netlify** and **Vercel**.

---

## 🚀 Option 1: Deploy to Netlify (Recommended)

Netlify is already fully configured for your project!

### Prerequisites
- A [Netlify account](https://app.netlify.com/signup) (free)
- Your OpenAI API key from [OpenAI Platform](https://platform.openai.com/account/api-keys)

### Deployment Steps

#### Method A: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Build your React app**
   ```bash
   npm run build
   ```

4. **Deploy to Netlify**
   ```bash
   # For preview deployment
   netlify deploy
   
   # For production deployment
   netlify deploy --prod
   ```

5. **Set Environment Variables**
   - Go to your Netlify site dashboard
   - Navigate to **Site settings** → **Environment variables**
   - Click **Add a variable**
   - Add: `OPENAI_API_KEY` = `your_openai_api_key_here`
   - Click **Save**

#### Method B: Deploy via Netlify Dashboard (Git-based)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click **Add new site** → **Import an existing project**
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Functions directory: `netlify/functions`
   - Click **Deploy**

4. **Set Environment Variables**
   - After deployment, go to **Site settings** → **Environment variables**
   - Add: `OPENAI_API_KEY` = `your_openai_api_key_here`
   - Click **Save** and redeploy

### Netlify Configuration Files
- `netlify.toml` - Build and redirect configuration ✅
- `netlify/functions/check.js` - Serverless function for /api/check endpoint ✅

---

## 🚀 Option 2: Deploy to Vercel

Vercel is now configured and ready for deployment!

### Prerequisites
- A [Vercel account](https://vercel.com/signup) (free)
- Your OpenAI API key from [OpenAI Platform](https://platform.openai.com/account/api-keys)

### Deployment Steps

#### Method A: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**
   ```bash
   # For preview deployment
   vercel
   
   # For production deployment
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   # Add environment variable via CLI
   vercel env add OPENAI_API_KEY
   # Then paste your OpenAI API key when prompted
   
   # Or set via dashboard:
   # Go to your project on vercel.com
   # Settings → Environment Variables
   # Add: OPENAI_API_KEY = your_openai_api_key_here
   ```

#### Method B: Deploy via Vercel Dashboard (Git-based)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **Add New** → **Project**
   - Import your Git repository
   - Vercel will auto-detect React and configure settings

3. **Configure Build Settings** (usually auto-detected)
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

4. **Set Environment Variables**
   - Before clicking **Deploy**, go to **Environment Variables**
   - Add: `OPENAI_API_KEY` = `your_openai_api_key_here`
   - Click **Deploy**

### Vercel Configuration Files
- `vercel.json` - Build and routing configuration ✅
- `api/check.js` - Serverless function for /api/check endpoint ✅

---

## 📋 Post-Deployment Checklist

After deployment to either platform:

### 1. Test Your API Endpoint
```bash
# Replace YOUR_DOMAIN with your actual deployment URL
curl -X POST https://YOUR_DOMAIN/api/check \
  -H "Content-Type: application/json" \
  -d '{"query": "Test news verification"}'
```

### 2. Test in Browser
- Open your deployed URL
- Enter a news query in Vietnamese or English
- Click "Check" and verify results appear

### 3. Monitor Logs
- **Netlify**: Functions tab → View logs
- **Vercel**: Deployments → Click deployment → View function logs

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **401 Unauthorized Error (OpenAI API)**
**Problem:** OpenAI API key not set or invalid

**Solution:**
- Verify your API key is correct on [OpenAI Platform](https://platform.openai.com/account/api-keys)
- Re-add the environment variable on Netlify/Vercel
- Redeploy your application

#### 2. **Functions Timing Out**
**Problem:** Scraping multiple news sources takes too long

**Solution:**
- The app already has timeout handling (25s for Netlify, 10s default for Vercel)
- Consider upgrading to Netlify Pro or Vercel Pro for longer timeouts
- Reduce number of news sources in production

#### 3. **CORS Errors**
**Problem:** Frontend can't connect to API

**Solution:**
- Both Netlify and Vercel functions already have CORS headers configured
- Check browser console for specific error messages

#### 4. **Build Failures**
**Problem:** Deployment fails during build

**Solution:**
```bash
# Test build locally first
npm run build

# Check for errors in build output
# Fix any warnings or errors before deploying
```

---

## 🌐 Custom Domain (Optional)

### For Netlify
1. Go to **Domain settings** → **Add custom domain**
2. Follow DNS configuration instructions
3. Netlify provides free SSL certificates

### For Vercel
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel provides automatic SSL certificates

---

## 💰 Pricing Considerations

### OpenAI API Costs
- GPT-4o-mini pricing: ~$0.15 per 1M input tokens
- Each query costs approximately $0.001-0.003
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

### Netlify Pricing
- **Free tier**: 100GB bandwidth, 300 build minutes/month
- **Functions**: 125,000 requests/month (free tier)
- More info: [Netlify Pricing](https://www.netlify.com/pricing/)

### Vercel Pricing
- **Free tier**: 100GB bandwidth, 6,000 build minutes/month
- **Serverless Functions**: Generous free tier
- More info: [Vercel Pricing](https://vercel.com/pricing)

---

## 📊 Recommended Platform

| Feature | Netlify | Vercel |
|---------|---------|--------|
| Setup Complexity | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐⭐⭐ Easy |
| Function Timeout (Free) | 10s (26s background) | 10s |
| Cold Start Performance | Good | Excellent |
| Pricing (Free Tier) | Very generous | Very generous |
| Documentation | Excellent | Excellent |

**Recommendation:** Both platforms work great! Choose based on your preference:
- **Netlify**: Better for larger free tier bandwidth
- **Vercel**: Better for Next.js projects and faster cold starts

---

## 🎉 You're Done!

Your PressAI news verification app is now deployed and accessible worldwide!

**Next Steps:**
- Share your deployment URL
- Monitor API usage and costs
- Consider adding analytics (Google Analytics, Plausible, etc.)
- Set up custom domain for professional appearance

Need help? Check the logs on your chosen platform or review the error messages.
