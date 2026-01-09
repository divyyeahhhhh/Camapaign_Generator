
import { GoogleGenAI, Type } from "@google/genai";
import { AIContentRequest, AIContentResult } from "../types.ts";

export const generateMarketingContent = async (request: AIContentRequest): Promise<AIContentResult> => {
  // Defensive check for API Key
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: The strategic engine requires an active API key in the environment.");
  }

  // Initialize right before use to ensure environment variables are captured
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Generate professional BFSI marketing content for the following request:
    Channel: ${request.channel}
    Target/Context: ${request.prompt}
    Tone: ${request.tone}
    
    Ensure the content is compliant with financial regulations.
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: "Subject line or headline" },
            content: { type: Type.STRING, description: "The main body content" },
            hashtags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Suggested hashtags for social media" 
            }
          },
          required: ["content"]
        }
      }
    });

    // Access .text as a property, not a method
    const text = result.text;
    if (!text) throw new Error("EMPTY_AI_RESPONSE");
    
    return JSON.parse(text) as AIContentResult;
  } catch (error) {
    console.error("AI Generation Critical Error:", error);
    throw error;
  }
};

export const analyzeLeadStrategy = async (leadData: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Strategic engine key missing.";

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  try {
    const result = await ai.models.generateContent({
      model,
      contents: `Analyze this lead information and suggest the best marketing follow-up strategy: ${leadData}`,
      config: {
        systemInstruction: "You are a senior marketing strategist. Be concise and actionable."
      }
    });

    // Access .text as a property
    return result.text || "Unable to analyze at this time.";
  } catch (error) {
    console.error("Lead Analysis Critical Error:", error);
    return "Strategic engine temporarily offline.";
  }
};
