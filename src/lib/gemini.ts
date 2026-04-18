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
  const realismKeywords = "masterwork, top quality, ultra-photorealistic, 8k uhd, cinematic lighting, incredibly detailed skin texture, hyper-realistic eyes, sharp focus, f/1.8 lens bokeh, soft volumetric shadows, high dynamic range, raw photography, unedited, professional fashion studio lighting, extreme detail, 8k resolution, authentic textures";
  const fullPrompt = `RAW photorealistic portrait of an elegant woman: ${params.prompt}. Style: ${params.style || 'artistic glamour'}. Technique: ${realismKeywords}. Ensure absolute anatomical correctness and natural lighting.`;

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
