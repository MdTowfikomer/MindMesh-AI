// API Configuration — All AI calls go through the Vercel proxy server (API keys stay server-side)

export const API_CONFIG = {
  // Deployed production Vercel proxy server URL
  PROXY_BASE_URL: process.env.EXPO_PUBLIC_PROXY_URL || 'https://mindmesh-api.vercel.app',

  // App secret for authenticating with the proxy
  APP_SECRET: process.env.EXPO_PUBLIC_APP_SECRET || 'SHIPATHON',

  // Endpoints
  VISION_ENDPOINT: '/api/v1/ai/vision',
  AUDIO_ENDPOINT: '/api/v1/ai/audio',
  GENERATE_ENDPOINT: '/api/v1/ai/generate',
  ENRICH_URL_ENDPOINT: '/api/v1/enrich-url',
  CONFIG_ENDPOINT: '/api/v1/config',
  LOG_ENDPOINT: '/api/v1/log',
};
