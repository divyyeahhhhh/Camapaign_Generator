
import { GoogleGenAI, Type } from "@google/genai";
import { AIContentRequest, AIContentResult } from "../types.ts";

export const generateMarketingContent = async (request: AIContentRequest): Promise<AIContentResult> => {
  // Use API key directly from process.env as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Generate professional BFSI marketing content for the following request:
    Channel: ${request.channel}
    Target/Context: ${request.prompt}
    Tone: ${request.tone}
    
    Ensure the content is compliant with financial regulations. Return JSON.
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

    const text = result.text;
    if (!text) throw new Error("No text returned from Strategic Engine.");
    
    return JSON.parse(text) as AIContentResult;
  } catch (error) {
    console.error("AI Content Studio Error:", error);
    throw error;
  }
};

export const analyzeLeadStrategy = async (leadData: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const model = "gemini-3-flash-preview";

  try {
    const result = await ai.models.generateContent({
      model,
      contents: `Analyze this lead information and suggest the best marketing follow-up strategy: ${leadData}`,
      config: {
        systemInstruction: "You are a senior marketing strategist. Be concise and actionable."
      }
    });

    return result.text || "Unable to analyze at this time.";
  } catch (error) {
    console.error("Lead Strategy Error:", error);
    return "Strategic engine temporarily offline.";
  }
};
