
import { GoogleGenAI, Type } from "@google/genai";
import { AIContentRequest, AIContentResult } from "../types.ts";

/**
 * Service to handle the Strategic Reasoning Engine.
 * Consolidated logic for BFSI campaign generation.
 */
export const generateCampaignMessage = async (customer: any, prompt: string, tone: string) => {
  // Defensive initialization for production environments
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: Strategic Engine API Key is missing in this environment.");
    throw new Error("AUTH_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
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

    // property access per SDK guidelines
    const text = response.text;
    if (!text) throw new Error("EMPTY_STRATEGIC_RESPONSE");
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Strategic Engine Row Execution Error:", error);
    throw error;
  }
};

export const generateMarketingContent = async (request: AIContentRequest): Promise<AIContentResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Strategic API Key required");

  const ai = new GoogleGenAI({ apiKey });
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
    console.error("Marketing Content Hub Error:", error);
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
      contents: `Analyze this lead info for BFSI strategy and suggest follow-up steps: ${leadData}`,
      config: { systemInstruction: "You are a senior banking advisor. Be concise, ethical, and professional." }
    });

    return result.text || "No strategy available at this time.";
  } catch (error) {
    console.error("Lead Strategy Analysis Error:", error);
    return "Strategic engine temporarily offline.";
  }
};
