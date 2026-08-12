import Constants from 'expo-constants';

// Reads from .env via Expo's extra config or environment variables
// Add GEMINI_API_KEY to your .env file (never commit it)
export const API_CONFIG = {
  GEMINI_API_KEY: Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  GEMINI_MODEL: 'gemini-3.5-flash-lite',
  GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
};
