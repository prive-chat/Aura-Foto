import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

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
  isHighRes?: boolean;
  referenceImage?: string; // Base64 data:image/...
}

/**
 * Enhanced Prompt Generator
 * Converts a simple prompt into a professional artistic directive.
 */
export async function enhancePrompt(simplePrompt: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Gemini API Key missing for enhancePrompt");
    return simplePrompt;
  }

  try {
    const aiInstance = new GoogleGenAI({ apiKey });
    const response = await aiInstance.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Actúa como un experto director de arte y fotógrafo profesional. 
Mejora el siguiente prompt para que produzca una imagen fotorrealista de calidad cinematográfica, detallada y artísticamente impactante. 
Envuélvelo en términos técnicos (lentes, iluminación, composición). 
Responde ÚNICAMENTE con el prompt mejorado en inglés para optimizar la IA de imagen. No des explicaciones.

Prompt simple: ${simplePrompt}`,
      config: {
        maxOutputTokens: 250,
        temperature: 0.7
      }
    });

    return response.text?.trim() || simplePrompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return simplePrompt;
  }
}

async function urlToBase64(url: string): Promise<{ data: string, mimeType: string }> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const mimeType = blob.type;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const data = base64String.split(',')[1];
        resolve({ data, mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to base64:", error);
    throw new Error("Failed to process reference image from URL");
  }
}

export async function generateArtisticPortrait(params: ImageGenerationParams): Promise<string> {
  const realismKeywords = "raw photo, shot on 35mm lens, f/1.8, incredibly detailed skin pores, natural skin texture, masterpiece, 8k uhd, cinematic lighting, hyper-realistic eyes, sharp focus, professional photography, authentic textures, high dynamic range, subsurface scattering";
  
  // Use high-res model if requested
  const modelName = params.isHighRes ? 'gemini-3.1-flash-image-preview' : 'gemini-2.5-flash-image';
  
  // Simplified and more direct prompt for the image generation model
  const fullPrompt = `${params.prompt}. Professional raw photography, ${params.style || 'natural'} lighting, ${realismKeywords}. Authentic human features, photorealism.${params.referenceImage ? " Strictly follow the structural reference from the provided image." : ""}`;

  const contents: any = {
    parts: [{ text: fullPrompt }]
  };

  if (params.referenceImage) {
    if (params.referenceImage.startsWith('http')) {
      const { data, mimeType } = await urlToBase64(params.referenceImage);
      contents.parts.push({
        inlineData: {
          data: data,
          mimeType: mimeType
        }
      });
    } else {
      const parts = params.referenceImage.split(',');
      if (parts.length > 1) {
        const header = parts[0];
        const data = parts[1];
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
        contents.parts.push({
          inlineData: {
            data: data,
            mimeType: mimeType
          }
        });
      }
    }
  }
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        imageConfig: {
          aspectRatio: params.aspectRatio,
          imageSize: "1K"
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          }
        ]
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("El modelo de IA no pudo generar candidatos. Intenta con un prompt diferente.");
    }

    const candidate = response.candidates[0];
    
    // Check if safety filters blocked the response
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("La generación fue bloqueada por filtros de seguridad. El prompt podría ser demasiado sensible.");
    }

    if (candidate.content?.parts) {
      let rejectionText = "";
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
        if (part.text) {
          rejectionText += part.text;
        }
      }
      
      if (rejectionText.trim()) {
        throw new Error(`El modelo no devolvió una imagen poque: "${rejectionText.substring(0, 150)}..."`);
      }
    }
    
    throw new Error("No image data returned from model. Try a different prompt or simpler style.");
  } catch (error: any) {
    console.error("Error generating image:", error);
    // Propagate more helpful errors
    if (error.message?.includes('SAFETY')) {
      throw new Error("La IA bloqueó el prompt por seguridad. Intenta algo menos descriptivo o sensible.");
    }
    throw error;
  }
}
