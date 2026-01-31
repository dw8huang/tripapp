
import { GoogleGenAI, Type } from "@google/genai";

// Cache to prevent redundant API calls for the same query
const searchCache = new Map();

/**
 * Validates the API key from environment variables.
 * Returns true if the key is present and not a placeholder.
 */
const hasValidApiKey = () => {
  const apiKey = process.env.API_KEY;
  return !!(apiKey && apiKey !== '""' && apiKey !== "''" && apiKey.trim() !== "");
};

export async function searchPlaces(query: string, city: string) {
  if (!hasValidApiKey()) {
    console.warn("Gemini API Key is missing. Place search disabled.");
    return [];
  }

  const cacheKey = `places:${city}:${query}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  try {
    // Direct initialization with named parameter as required by guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List 5 popular places matching "${query}" in ${city}. Return a valid JSON array where each item has "name", "lat" (number), and "lng" (number).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
            },
            required: ["name", "lat", "lng"],
          },
        },
      },
    });

    // Directly access text property as per guidelines (not a method call)
    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    searchCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Place search failed:", error);
    return [];
  }
}

export async function searchCities(query: string) {
  if (!hasValidApiKey()) {
    console.warn("Gemini API Key is missing. City search disabled.");
    return [];
  }

  const cacheKey = `cities:${query}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  try {
    // Direct initialization with named parameter as required by guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the top 5 cities matching "${query}". Return a valid JSON array where each item has "name", "lat" (number), and "lng" (number).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
            },
            required: ["name", "lat", "lng"],
          },
        },
      },
    });

    // Directly access text property as per guidelines (not a method call)
    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    searchCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("City search failed:", error);
    return [];
  }
}
