
import { GoogleGenAI, Type } from "@google/genai";
import { AIContentRequest, AIContentResult } from "../types.ts";

/**
 * Service to handle the Strategic Reasoning Engine.
 * Moves complex AI logic away from the UI components.
 */
export const generateCampaignMessage = async (customer: any, prompt: string, tone: string) => {
  // Initialize right before call to ensure environment variables are available
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const model = 'gemini-3-flash-preview';

  const contents = `Act as a Senior BFSI Strategist and Compliance Officer. 
    CUSTOMER DATA: ${JSON.stringify(customer)}
    CAMPAIGN GOAL: ${prompt}
    TARGET TONE: ${tone}
    
    TASK:
    1. Generate a personalized marketing message.
    2. Provide 'complianceAnalysis' for banking standards.
    3. Provide 'strategyLogic'.
    4. Score compliance from 0-100.
    5. Set AI Confidence from 0-100.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            content: { type: Type.STRING },
            complianceScore: { type: Type.INTEGER },
            aiConfidence: { type: Type.INTEGER },
            complianceAnalysis: { type: Type.STRING },
            strategyLogic: { type: Type.STRING }
          },
          required: ["subject", "content", "complianceScore", "aiConfidence", "complianceAnalysis", "strategyLogic"]
        }
      }
    });

    // property access per guidelines
    const text = response.text;
    if (!text) throw new Error("EMPTY_STRATEGIC_RESPONSE");
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};

export const generateMarketingContent = async (request: AIContentRequest): Promise<AIContentResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const model = "gemini-3-flash-preview";
  
  const prompt = `Generate professional BFSI marketing content: ${request.prompt}. Tone: ${request.tone}. Channel: ${request.channel}.`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            content: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["content"]
        }
      }
    });

    return JSON.parse(result.text || '{}') as AIContentResult;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const analyzeLeadStrategy = async (leadData: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const model = "gemini-3-flash-preview";

  try {
    const result = await ai.models.generateContent({
      model,
      contents: `Analyze this lead info for BFSI strategy: ${leadData}`,
      config: { systemInstruction: "Be concise and professional." }
    });

    return result.text || "No strategy available.";
  } catch (error) {
    return "Strategic engine temporarily offline.";
  }
};
