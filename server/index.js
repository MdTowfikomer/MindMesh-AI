require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-flash-latest';

// Direct REST API helper using gemini-flash-latest
async function generateContentGemini(contents) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on backend server');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  const data = await response.json();

  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    console.log(`[MindMesh Server] ✅ Success using model: ${MODEL_NAME}`);
    return {
      text: data.candidates[0].content.parts[0].text,
      modelUsed: MODEL_NAME,
    };
  }

  if (data.error) {
    console.error(`[MindMesh Server] Error using ${MODEL_NAME}:`, data.error.message);
    throw new Error(data.error.message);
  }

  throw new Error('Gemini API returned empty response');
}

// ─── Rate Limiting (Simple In-Memory) ─────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;

function rateLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return next();
  }

  const record = rateLimitMap.get(ip);
  if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return next();
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again in a minute.' });
  }

  record.count++;
  return next();
}

function authMiddleware(req, res, next) {
  const appSecret = process.env.APP_SECRET;
  if (!appSecret) return next();

  const clientKey = req.headers['x-app-key'];
  if (clientKey !== appSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.use('/api/v1', rateLimiter, authMiddleware);

// ─── Health Check & Remote Config ─────────────────────────────────────────────
app.get('/api/v1/config', (req, res) => {
  res.json({
    status: 'online',
    appName: 'MindMesh AI Proxy',
    version: '0.1.0',
    keyReplaceable: true,
    mockPurchasesEnabled: true,
    activeModel: MODEL_NAME,
    message: 'MindMesh AI backend proxy server running smoothly.',
  });
});

// ─── Social & Web URL Enrichment Scraper ──────────────────────────────────────
app.post('/api/v1/enrich-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const html = await response.text();

    const isBlocked =
      (html.includes('login') && html.includes('password')) ||
      html.includes('captcha') ||
      html.includes('are you a robot') ||
      html.length < 500 ||
      response.status === 403 ||
      response.status === 429;

    if (isBlocked) {
      let domain = 'unknown';
      try { domain = new URL(url).hostname; } catch (e) {}

      return res.json({
        success: false,
        blocked: true,
        domain,
        imageUrl: null,
        title: null,
        description: null,
        message: `Scraping blocked by ${domain}`,
      });
    }

    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);

    return res.json({
      success: true,
      blocked: false,
      imageUrl: ogImageMatch ? ogImageMatch[1] : null,
      title: ogTitleMatch ? ogTitleMatch[1] : 'Social Media Post',
      description: ogDescMatch ? ogDescMatch[1] : 'Captured social media post visual card.',
    });
  } catch (error) {
    console.error(`[MindMesh Server] ❌ SCRAPE FAILED for ${req.body.url}:`, error.message);
    return res.status(500).json({
      error: 'URL Enrichment Failed',
      blocked: true,
      details: error.message,
    });
  }
});

// ─── AI Text Generation Proxy ─────────────────────────────────────────────────
app.post('/api/v1/ai/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const contents = [{ parts: [{ text: prompt }] }];
    const result = await generateContentGemini(contents);
    return res.json({
      success: true,
      text: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error) {
    console.error('[MindMesh Server] Error in /api/v1/ai/generate:', error.message);
    return res.status(500).json({
      error: 'AI Proxy Request Failed',
      details: error.message,
    });
  }
});

// ─── AI Vision Proxy (Image Analysis) ─────────────────────────────────────────
app.post('/api/v1/ai/vision', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!prompt || !imageBase64) {
      return res.status(400).json({ error: 'prompt and imageBase64 are required' });
    }

    const contents = [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ];

    const result = await generateContentGemini(contents);
    return res.json({
      success: true,
      text: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error) {
    console.error('[MindMesh Server] Error in /api/v1/ai/vision:', error.message);
    return res.status(500).json({
      error: 'Vision AI Proxy Request Failed',
      details: error.message,
    });
  }
});

// ─── AI Audio Proxy (Voice Transcription) ─────────────────────────────────────
app.post('/api/v1/ai/audio', async (req, res) => {
  try {
    const { prompt, audioBase64, mimeType = 'audio/mp4' } = req.body;
    if (!prompt || !audioBase64) {
      return res.status(400).json({ error: 'prompt and audioBase64 are required' });
    }

    const contents = [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
        ],
      },
    ];

    const result = await generateContentGemini(contents);
    return res.json({
      success: true,
      text: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error) {
    console.error('[MindMesh Server] Error in /api/v1/ai/audio:', error.message);
    return res.status(500).json({
      error: 'Audio AI Proxy Request Failed',
      details: error.message,
    });
  }
});

// ─── Cleanup stale rate limit entries ─────────────────────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.startTime > RATE_LIMIT_WINDOW_MS * 5) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`[MindMesh Server] Proxy running on port ${PORT}`);
});

module.exports = app;
