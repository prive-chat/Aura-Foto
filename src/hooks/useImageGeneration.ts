import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '../contexts/HistoryContext';
import { generateArtisticPortrait, enhancePrompt } from '../lib/gemini';
import { uploadBase64Image, supabase } from '../lib/supabase';
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
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  const { user, profile, refreshProfile } = useAuth();
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

    if (profile && profile.daily_usage_count + batchCount > profile.max_daily_limit) {
      setError(`Límite diario alcanzado (${profile.daily_usage_count}/${profile.max_daily_limit}). Vuelve mañana o contacta a soporte para ampliar tu plan.`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatePromises = Array.from({ length: batchCount }).map(() => 
        generateArtisticPortrait({
          prompt,
          aspectRatio,
          style,
          isHighRes,
          referenceImage: referenceImage || undefined
        })
      );

      const base64Images = await Promise.all(generatePromises);
      const newImages: GeneratedImage[] = [];

      for (const base64 of base64Images) {
        let cloudUrl = base64;
        let dbId = Math.random().toString(36).substring(7);

        if (user) {
          try {
            // 1. Upload to storage
            cloudUrl = await uploadBase64Image(base64, user.id);
            
            // 2. Persist to database
            const { data: dbData, error: dbError } = await supabase
              .from('images')
              .insert({
                user_id: user.id,
                url: cloudUrl,
                prompt: prompt
              })
              .select()
              .single();

            if (!dbError && dbData) {
              dbId = dbData.id;
            } else {
              console.error("Error saving image to DB:", dbError);
            }
          } catch (err) {
            console.error("Cloud persist error:", err);
          }
        }

        newImages.push({
          id: dbId,
          url: cloudUrl,
          prompt,
          timestamp: Date.now(),
          userId: user?.id
        });
      }

      addImages(newImages);
      
      if (user) {
        await supabase.rpc('increment_usage', { user_id: user.id, inc: batchCount });
        await refreshProfile();
      }

      return newImages[0];
    } catch (err: any) {
      if (err?.message?.includes('429') || err?.status === 'RESOURCE_EXHAUSTED' || JSON.stringify(err).includes('429')) {
        setError('Cuota de IA excedida. Por favor, espera un minuto o reduce la "Cantidad" de imágenes a 1.');
      } else if (err?.message) {
        setError(err.message);
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
    referenceImage,
    setReferenceImage,
    handleGenerate,
    handleEnhancePrompt
  };
}
