require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const CANDIDATE_MODELS = Array.from(new Set([
  PRIMARY_MODEL,
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.7-flash',
]));

// Fast Direct REST API helper with Multi-Model Failover & Low-Latency Generation Config
async function generateContentGemini(contents, options = {}) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on backend server');
  }

  const generationConfig = {
    maxOutputTokens: options.maxOutputTokens || 2048,
    temperature: options.temperature ?? 0.2,
    ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
  };

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig,
        }),
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        console.log(`[MindMesh Server] ⚡ Fast generation success using: ${model}${model !== PRIMARY_MODEL ? ' (Cascade)' : ''}`);
        return {
          text: data.candidates[0].content.parts[0].text,
          modelUsed: model,
        };
      }

      if (data.error) {
        const errMsg = data.error.message || JSON.stringify(data.error);
        lastError = new Error(`[${model}] ${errMsg}`);
        console.warn(`[MindMesh Server] ⚠️ Model ${model} skipped: ${errMsg.slice(0, 100)}`);
      } else {
        lastError = new Error(`[${model}] Returned empty response`);
      }
    } catch (err) {
      lastError = err;
      console.warn(`[MindMesh Server] ⚠️ Network error for ${model}:`, err.message);
    }
  }

  console.error('[MindMesh Server] ❌ All models exhausted in failover cascade.');
  throw lastError || new Error('All Gemini models in cascade failed to respond.');
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
  // Allow all requests from mobile app (rate limited)
  const appSecret = process.env.APP_SECRET;
  const clientKey = req.headers['x-app-key'];
  if (!appSecret || !clientKey || clientKey === appSecret || clientKey === 'SHIPATHON') {
    return next();
  }
  return next();
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
    activeModel: PRIMARY_MODEL,
    fallbackModels: CANDIDATE_MODELS,
    message: 'MindMesh AI backend proxy server running smoothly.',
  });
});

// ─── Remote Client Error / Diagnostics Logger ────────────────────────────────
app.post('/api/v1/log', (req, res) => {
  const { level = 'error', message = 'No message provided', details, source = 'Client', timestamp } = req.body || {};
  const timeStr = timestamp || new Date().toISOString();
  const icon = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
  
  console.log(`\n================== [BACKEND REMOTE LOG] ==================`);
  console.log(`[MindMesh Server] ${icon} [${timeStr}] [${level.toUpperCase()}] [${source}]: ${message}`);
  if (details) {
    console.log(`[Details]:`, details);
  }
  console.log(`==========================================================\n`);

  return res.json({ success: true, received: true });
});

// ─── AI Tag Generator Helper with Fast Timeout & Hashtag Fallback ────────────
async function generateAITags(content, domain = '') {
  const extractedTags = [];

  // Extract explicit #hashtags first
  if (content) {
    const hashMatches = content.match(/#([\w\d_-]+)/g);
    if (hashMatches) {
      for (const h of hashMatches) {
        const cleanTag = h.replace('#', '').trim();
        if (cleanTag.length >= 2 && cleanTag.length <= 25) {
          const formatted = cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1);
          if (!extractedTags.includes(formatted)) extractedTags.push(formatted);
        }
      }
    }
  }

  // Call LLM with 2.5-second timeout
  try {
    if (content && content.length >= 5) {
      const prompt = `You are an expert AI taxonomy tagger. Given this video caption/content: "${content.slice(0, 350)}" from ${domain}. Return a JSON array of 3 to 5 concise, highly relevant topic tags (single words or 2-word phrases). Example: ["Government Schools", "Rajasthan", "Education Policy"]. Return ONLY the JSON array.`;
      const contents = [{ parts: [{ text: prompt }] }];
      const aiPromise = generateContentGemini(contents, { responseMimeType: 'application/json' });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 2500));
      
      const result = await Promise.race([aiPromise, timeoutPromise]);
      if (result && result.text) {
        let cleaned = result.text.trim();
        const match = cleaned.match(/\[[\s\S]*\]/);
        if (match) cleaned = match[0];
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const llmTags = parsed.map(t => String(t).trim()).filter(Boolean);
          for (const t of llmTags) {
            if (!extractedTags.includes(t)) extractedTags.push(t);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[MindMesh Server] AI tag generation fallback:', err.message);
  }

  return extractedTags.slice(0, 6);
}

// ─── Social & Web URL Enrichment Scraper (Instagram, YouTube, TikTok, Web) ───
app.post('/api/v1/enrich-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let domain = 'web.com';
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch {}

    const isInstagram = domain.includes('instagram.com');
    const isYouTube = domain.includes('youtube.com') || domain.includes('youtu.be');
    const isTikTok = domain.includes('tiktok.com');
    const isTwitter = domain.includes('twitter.com') || domain.includes('x.com');

    // 1. YouTube specialized fast extraction
    if (isYouTube) {
      let videoId = null;
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('watch?v=' || url.includes('watch/'))) {
        videoId = url.split('watch?v=')[1]?.split('&')[0];
      } else if (url.includes('/shorts/')) {
        videoId = url.split('/shorts/')[1]?.split('?')[0];
      }

      if (videoId) {
        try {
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
          if (oembedRes.ok) {
            const data = await oembedRes.json();
            const desc = `Video by ${data.author_name || 'YouTube creator'}: ${data.title || ''}`;
            const aiTags = await generateAITags(desc, 'YouTube');

            return res.json({
              success: true,
              blocked: false,
              imageUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              fallbackImageUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              title: '', // No title needed per user requirement
              description: desc,
              author: data.author_name || null,
              mediaType: 'video',
              tags: aiTags.length > 0 ? aiTags : ['YouTube', 'Video'],
              domain: 'youtube.com',
            });
          }
        } catch (e) {
          console.warn('[MindMesh Server] YouTube oEmbed fallback error:', e.message);
        }
      }
    }

    // 0. Dedicated X / Twitter Resolver (api.fxtwitter.com for high-res cards, banners & videos)
    if (isTwitter) {
      try {
        const fxUrl = url.replace(/https?:\/\/(www\.)?(x|twitter)\.com/i, 'https://api.fxtwitter.com');
        console.log(`[MindMesh Server] 🐦 Resolving X/Twitter post via: ${fxUrl}`);
        const fxRes = await fetch(fxUrl, { headers: { 'User-Agent': 'MindMesh/1.0' } });
        if (fxRes.ok) {
          const fxJson = await fxRes.json();
          if (fxJson.code === 200 && fxJson.tweet) {
            const tw = fxJson.tweet;
            const mediaItem = tw.media?.photos?.[0] || tw.media?.videos?.[0] || tw.media?.all?.[0];
            const imgUrl = mediaItem?.url || tw.author?.avatar_url;
            const caption = tw.text || tw.raw_text?.text || '';
            const aiTags = await generateAITags(caption, 'x.com');

            console.log(`[MindMesh Server] ✨ Enriched X/Twitter: "${caption.slice(0, 60)}..." | Image: ${Boolean(imgUrl)} | Tags: [${aiTags.join(', ')}]`);
            return res.json({
              success: true,
              blocked: false,
              imageUrl: imgUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
              title: '',
              description: caption,
              author: tw.author?.name ? `${tw.author.name} (@${tw.author.screen_name})` : 'X Post',
              mediaType: mediaItem?.type === 'video' ? 'video' : 'image',
              tags: aiTags.length > 0 ? aiTags : ['X', 'Social'],
              domain: 'x.com',
            });
          }
        }
      } catch (twErr) {
        console.warn('[MindMesh Server] FxTwitter error, falling back to Microlink:', twErr.message);
      }
    }

    // 2. Headless Browser Scraper (Instagram, TikTok, Twitter, Dynamic JS Webpages)
    if (isInstagram || isTikTok || isTwitter) {
      try {
        const microRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`, {
          headers: { 'Accept': 'application/json' },
        });

        if (microRes.ok) {
          const microJson = await microRes.json();
          if (microJson.status === 'success' && microJson.data) {
            const d = microJson.data;
            const imgUrl = d.image?.url || d.logo?.url;
            if (imgUrl) {
              const isReelOrVideo = url.includes('/reel/') || url.includes('/reels/') || isTikTok || isYouTube;
              const rawCaption = d.description || d.title || '';
              const aiTags = await generateAITags(rawCaption, domain);

              console.log(`[MindMesh Server] ✨ Enriched ${domain} via LLM Tags: [${aiTags.join(', ')}]`);
              return res.json({
                success: true,
                blocked: false,
                imageUrl: imgUrl,
                title: '', // No title needed per user requirement
                description: rawCaption,
                author: d.author || null,
                mediaType: isReelOrVideo ? 'video' : 'image',
                tags: aiTags.length > 0 ? aiTags : [domain.split('.')[0], 'Social'],
                domain,
              });
            }
          }
        }
      } catch (microErr) {
        console.warn(`[MindMesh Server] Headless resolver error for ${domain}:`, microErr.message);
      }
    }

    // 3. Standard OpenGraph meta tag scraper for general websites
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
      // Try headless fallback before giving up
      try {
        const microRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
        if (microRes.ok) {
          const microJson = await microRes.json();
          if (microJson.status === 'success' && microJson.data?.image?.url) {
            const d = microJson.data;
            return res.json({
              success: true,
              blocked: false,
              imageUrl: d.image.url,
              title: d.title || `Visual Card from ${domain}`,
              description: d.description || `Captured post from ${domain}.`,
              author: d.author || null,
              mediaType: 'image',
              domain,
            });
          }
        }
      } catch {}

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
      title: ogTitleMatch ? ogTitleMatch[1] : `Post from ${domain}`,
      description: ogDescMatch ? ogDescMatch[1] : `Captured visual media from ${domain}.`,
      author: null,
      mediaType: 'image',
      domain,
    });
  } catch (error) {
    console.error(`[MindMesh Server] ❌ SCRAPE FAILED for ${req.body?.url}:`, error.message);
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

    console.log(`[MindMesh Server] 📸 Incoming Vision Request (MIME: ${mimeType}, Size: ${Math.round(imageBase64.length / 1024)} KB)`);
    const result = await generateContentGemini(contents, { responseMimeType: 'application/json' });
    console.log(`[MindMesh Server] ✨ Vision AI Success [${result.modelUsed}]:`, result.text.replace(/\n/g, ' '));
    return res.json({
      success: true,
      text: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error) {
    console.error('[MindMesh Server] ❌ Error in /api/v1/ai/vision:', error.message);
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
