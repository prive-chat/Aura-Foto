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
  // Use professional but direct keywords, avoiding "masterpiece" or "8k" which can trigger some filters
  const realismKeywords = "professional photography, high resolution, sharp focus, natural lighting, realistic textures, cinematic composition";
  
  // Use gemini-3.1-flash-image-preview as it's more robust for 1K resolution
  const modelName = params.isHighRes ? 'gemini-3.1-flash-image-preview' : 'gemini-2.5-flash-image';
  
  // Simplified prompt construction
  const stylePrefix = params.style ? `${params.style} style. ` : "";
  const fullPrompt = `${stylePrefix}${params.prompt}. ${realismKeywords}.${params.referenceImage ? " Transform the reference image while keeping its composition." : ""}`;

  const contents: any = {
    parts: [{ text: fullPrompt }]
  };

  if (params.referenceImage) {
    try {
      if (params.referenceImage.startsWith('http')) {
        const { data, mimeType } = await urlToBase64(params.referenceImage);
        contents.parts.push({
          inlineData: { data, mimeType }
        });
      } else {
        const matches = params.referenceImage.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          contents.parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }
    } catch (e) {
      console.warn("Failed to process reference image, falling back to text-only generation", e);
    }
  }
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        imageConfig: {
          aspectRatio: params.aspectRatio,
          imageSize: params.isHighRes ? "2K" : "1K"
        }
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("El modelo de IA no pudo generar candidatos. Intenta con un prompt diferente.");
    }

    const candidate = response.candidates[0];
    
    // Check if safety filters blocked the response
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("La generación fue bloqueada por filtros de seguridad. El contenido podría ser demasiado sensible.");
    }

    if (candidate.finishReason === 'RECITATION') {
      throw new Error("La generación fue bloqueada por derechos de autor (recitación). Intenta con un prompt más original.");
    }

    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      // If no image but has text, it might be an explanation or rejection
      const rejectionText = candidate.content.parts
        .filter(p => p.text)
        .map(p => p.text)
        .join(" ")
        .trim();

      if (rejectionText) {
        throw new Error(`La IA no pudo generar la imagen: "${rejectionText.substring(0, 100)}..."`);
      }
    }
    
    throw new Error("El modelo aceptó el prompt pero no devolvió datos de imagen. Intenta simplificar el prompt.");
  } catch (error: any) {
    console.error("Error in generateArtisticPortrait:", error);
    
    // Friendly error mappings
    if (error.status === 'PERMISSION_DENIED' || error.message?.includes('API key')) {
      throw new Error("Error de API: Verifica tu configuración o cuota de Gemini.");
    }
    
    if (error.message?.includes('SAFETY')) {
      throw new Error("Contenido bloqueado por seguridad. Prueba con un prompt alternativo.");
    }

    throw error;
  }
}
