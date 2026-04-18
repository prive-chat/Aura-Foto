import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '../contexts/HistoryContext';
import { generateArtisticPortrait, enhancePrompt } from '../lib/gemini';
import { uploadBase64Image } from '../lib/supabase';
import { GeneratedImage } from '../types';

export function useImageGeneration() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchCount, setBatchCount] = useState(1);
  const [isHighRes, setIsHighRes] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<any>('3:4');
  const [style, setStyle] = useState('Glamour Cinematográfico');
  
  const { user } = useAuth();
  const { addImages } = useHistory();

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (e) {
      console.error("Enhance error", e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const generatePromises = Array.from({ length: batchCount }).map(() => 
        generateArtisticPortrait({
          prompt,
          aspectRatio,
          style,
          isHighRes
        })
      );

      const base64Images = await Promise.all(generatePromises);
      const newImages: GeneratedImage[] = [];

      for (const base64 of base64Images) {
        let cloudUrl = base64;
        if (user) {
          cloudUrl = await uploadBase64Image(base64, user.id);
        }

        newImages.push({
          id: Math.random().toString(36).substring(7),
          url: cloudUrl,
          prompt,
          timestamp: Date.now(),
          userId: user?.id
        });
      }

      addImages(newImages);
      return newImages[0];
    } catch (err: any) {
      if (err?.message?.includes('429') || err?.status === 'RESOURCE_EXHAUSTED' || JSON.stringify(err).includes('429')) {
        setError('Cuota de IA excedida. Por favor, espera un minuto o reduce la "Cantidad" de imágenes a 1.');
      } else {
        setError('Error al generar la imagen. Verifica tu conexión.');
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    prompt,
    setPrompt,
    isGenerating,
    isEnhancing,
    error,
    batchCount,
    setBatchCount,
    isHighRes,
    setIsHighRes,
    aspectRatio,
    setAspectRatio,
    style,
    setStyle,
    handleGenerate,
    handleEnhancePrompt
  };
}
