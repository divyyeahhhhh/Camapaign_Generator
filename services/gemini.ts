
import { GoogleGenAI, Type } from "@google/genai";
import { AIContentRequest, AIContentResult } from "../types";

const getAI = () => {
  const apiKey = (process.env.API_KEY as string);
  return new GoogleGenAI({ apiKey });
};

export const generateMarketingContent = async (request: AIContentRequest): Promise<AIContentResult> => {
  const ai = getAI();
  // Using gemini-3-pro-preview for high-quality, complex creative marketing tasks
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Generate professional marketing content for the following request:
    Channel: ${request.channel}
    Target/Context: ${request.prompt}
    Tone: ${request.tone}
    
    If it is an email, provide a subject line and body.
    If it is social media, provide the post content and some relevant hashtags.
    If it is ad copy, provide a headline and description.
  `;

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

  // Extract the text directly from the response object as a string property
  const resultText = response.text;
  return JSON.parse(resultText || '{}') as AIContentResult;
};

export const analyzeLeadStrategy = async (leadData: string): Promise<string> => {
  const ai = getAI();
  // Using gemini-3-pro-preview for advanced strategic reasoning and decision making
  const model = "gemini-3-pro-preview";

  const response = await ai.models.generateContent({
    model,
    contents: `Analyze this lead information and suggest the best marketing follow-up strategy: ${leadData}`,
    config: {
      systemInstruction: "You are a senior marketing strategist. Be concise and actionable."
    }
  });

  // Extract text from response.text property
  return response.text || "Unable to analyze at this time.";
};
