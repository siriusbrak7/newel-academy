
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
const isPlaceholder = apiKey.includes('YOUR_GEMINI_API_KEY') || apiKey === '';

// Safely initialize
let ai: GoogleGenAI | null = null;
if (apiKey && !isPlaceholder) {
  ai = new GoogleGenAI({ apiKey });
}

// --- Rate Limiter (token-bucket: 10 requests per 60s) ---
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
let rateBucket = RATE_LIMIT_MAX;
let lastRefill = Date.now();

const consumeRateToken = (): boolean => {
  const now = Date.now();
  const elapsed = now - lastRefill;
  // Refill tokens proportionally
  rateBucket = Math.min(RATE_LIMIT_MAX, rateBucket + (elapsed / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_MAX);
  lastRefill = now;
  if (rateBucket >= 1) {
    rateBucket -= 1;
    return true;
  }
  return false;
};

export interface AIResponseConfig {
  json?: boolean;
  schema?: any;
  useSearch?: boolean;
}

const SYSTEM_INSTRUCTION = `You are an enthusiastic and helpful AI Science Tutor for Newel Academy. 
Your goal is to help students (grades 9-12) master scientific concepts. 
Be encouraging, concise, and use analogies suitable for teenagers. 
Format your responses using Markdown for clarity.
If the user asks about non-science topics, politely steer them back to science.`;

export const getAITutorResponse = async (
  prompt: string,
  context: string = '',
  config: AIResponseConfig = {}
): Promise<string> => {
  if (!ai) {
    return "AI service is not configured. Please set your GEMINI_API_KEY in .env.local.";
  }

  if (!consumeRateToken()) {
    return "You're sending messages too quickly. Please wait a moment and try again.";
  }

  try {
    const tools = config.useSearch ? [{ googleSearch: {} }] : undefined;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\nCurrent Context: ${context}`,
        responseMimeType: config.json ? "application/json" : undefined,
        responseSchema: config.schema,
        tools: tools,
      }
    });

    return response.text || "I'm having trouble thinking right now. Try again?";
  } catch (error: any) {
    const status = error?.status || error?.httpStatusCode;
    if (status === 429) {
      console.warn('[Gemini] Rate limited by API');
      return "The AI service is temporarily busy. Please wait a minute and try again.";
    }
    if (status === 401 || status === 403) {
      console.error('[Gemini] Authentication error:', error.message);
      return "AI authentication failed. Please check your API key configuration.";
    }
    console.error('[Gemini] Error:', error);
    return "Sorry, I encountered an error connecting to the science database. Please try again.";
  }
};

export const getAITutorStream = async (
  prompt: string,
  context: string = '',
  config: AIResponseConfig = {}
) => {
  if (!ai) throw new Error("AI service not configured. Please set your GEMINI_API_KEY in .env.local.");

  if (!consumeRateToken()) {
    throw new Error("Rate limit exceeded. Please wait a moment before sending another message.");
  }

  return ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\nCurrent Context: ${context}`,
      tools: config.useSearch ? [{ googleSearch: {} }] : undefined,
    }
  });
};

