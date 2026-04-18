import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  try {
    return process.env.GEMINI_API_KEY || '';
  } catch (e) {
    return '';
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export interface ImageGenerationParams {
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  style?: string;
}

export async function generateArtisticPortrait(params: ImageGenerationParams): Promise<string> {
  const realismKeywords = "raw photo, shot on 35mm lens, f/1.8, incredibly detailed skin pores, natural skin texture, masterpiece, 8k uhd, cinematic lighting, hyper-realistic eyes, sharp focus, professional photography, authentic textures, high dynamic range, subsurface scattering";
  
  // Refined prompt to push for ultra-realism and explicitly forbid "drawing" looks
  const fullPrompt = `PHOTOGRAPH of ${params.prompt}. (NO drawing, NO illustration, NO 3d render, NO painting, NO digital art). This is a professional raw photography shot. Lighting: ${params.style || 'natural'}. Camera settings: ${realismKeywords}. Ensure authentic human features, natural skin imperfections, and photorealistic depth of field.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: params.aspectRatio,
        },
        // Configuración de seguridad mínima permitida para máxima libertad creativa
        safetySettings: [
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
          }
        ]
      },
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data returned from model");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
