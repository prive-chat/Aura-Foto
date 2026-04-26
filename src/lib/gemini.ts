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
  // Use professional but direct keywords
  const realismKeywords = "high resolution, sharp focus, cinematic lighting, realistic textures, artistic composition, professional photography";
  
  // Use gemini-2.5-flash-image for reliable image generation without 403 errors
  const modelName = 'gemini-2.5-flash-image';
  
  // High-fidelity artistic prompt construction
  const stylePrefix = params.style ? `${params.style} style. ` : "";
  const fullPrompt = `Artistic Portrait. Style: ${params.style || 'Cinematic'}. Prompt: ${params.prompt}. Keywords: ${realismKeywords}.${params.referenceImage ? " Transform while respecting the composition of the reference image." : ""}`;

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
  
  // Safety settings to prevent false-positive blocks
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  ];
  
  try {
    // Standard AI Studio SDK usage for gemini-2.5-flash-image
    const request: any = {
      model: modelName,
      contents: contents, 
      config: {
        imageConfig: {
          aspectRatio: params.aspectRatio
        }
      },
      safetySettings
    };

    const response = await ai.models.generateContent(request);

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("El modelo de IA no generó una respuesta. Por favor, intenta de nuevo.");
    }

    const candidate = response.candidates[0];
    
    // Check for explicit finish reasons that indicate a failure to generate an image
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      if (candidate.finishReason === 'SAFETY') {
        throw new Error("La generación fue bloqueada por filtros de seguridad. El prompt podría ser demasiado sensible.");
      }
      if (candidate.finishReason === 'RECITATION') {
        throw new Error("Contenido bloqueado por derechos de autor. Intenta modificar el prompt.");
      }
      console.warn(`Generation ended with reason: ${candidate.finishReason}`);
    }

    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      // If no image but has text, it might be an explanation or rejection
      const textParts = candidate.content.parts
        .filter(p => p.text)
        .map(p => p.text)
        .join(" ")
        .trim();

      if (textParts) {
        throw new Error(`La IA no pudo generar el retrato: "${textParts.substring(0, 120)}..."`);
      }
    }
    
    throw new Error("El modelo procesó la solicitud pero no devolvió una imagen. Intenta simplificar el prompt o cambiar el estilo.");
  } catch (error: any) {
    console.error("Error in generateArtisticPortrait:", error);
    
    // Friendly error mappings
    if (error.status === 'PERMISSION_DENIED' || error.message?.includes('API key')) {
      throw new Error("Error de API: Verifica tu cuota o configuración en Google AI Studio.");
    }
    
    if (error.message?.includes('SAFETY')) {
      throw new Error("Contenido bloqueado por seguridad. Prueba con un prompt alternativo.");
    }

    if (error.message?.includes('INVALID_ARGUMENT')) {
      throw new Error("La configuración de la imagen es inválida. Prueba con una relación de aspecto diferente.");
    }

    throw error;
  }
}
