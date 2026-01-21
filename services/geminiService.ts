
import { GoogleGenAI, Type } from "@google/genai";

// Create a helper to get the AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  // Crucial: Only initialize if the key is actually a non-empty string
  if (!apiKey || apiKey.trim() === "") {
    console.warn("Gemini API Key is missing or empty. AI features will not work.");
    return null;
  }
  
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
    return null;
  }
};

const searchCache = new Map();

export async function searchPlaces(query: string, city: string) {
  const ai = getAI();
  if (!ai) {
    // Return mock or empty if AI is not available
    return [];
  }

  const cacheKey = `places:${city}:${query}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List 5 most relevant places matching "${query}" in/near ${city}. Return JSON array with name, lat, lng.`,
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

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text);
    searchCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Search places failed:", error);
    return [];
  }
}

export async function searchCities(query: string) {
  const ai = getAI();
  if (!ai) return [];

  const cacheKey = `cities:${query}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for top 5 cities matching "${query}". Return JSON with Name, Lat, Lng.`,
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
