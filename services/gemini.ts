
import { GoogleGenAI, Type } from "@google/genai";
import { AIContentRequest, AIContentResult } from "../types.ts";

const getAI = () => {
  // Safety check for environment variables to prevent WSoD during boot
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  if (!apiKey) {
    console.warn("API Key missing. Gemini features will be disabled.");
  }
  return new GoogleGenAI({ apiKey: apiKey as string });
};

export const generateMarketingContent = async (request: AIContentRequest): Promise<AIContentResult> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Generate professional marketing content for the following request:
    Channel: ${request.channel}
    Target/Context: ${request.prompt}
    Tone: ${request.tone}
    
    If it is an email, provide a subject line and body.
    If it is social media, provide the post content and some relevant hashtags.
    If it is ad copy, provide a headline and description.
  `;

  try {
    const response = await ai.models.generateContent({
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

    return JSON.parse(response.text || '{}') as AIContentResult;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const analyzeLeadStrategy = async (leadData: string): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze this lead information and suggest the best marketing follow-up strategy: ${leadData}`,
      config: {
        systemInstruction: "You are a senior marketing strategist. Be concise and actionable."
      }
    });

    return response.text || "Unable to analyze at this time.";
  } catch (error) {
    console.error("Lead Analysis Error:", error);
    return "Strategic engine temporarily offline.";
  }
};
