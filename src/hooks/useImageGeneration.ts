import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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

  // Persistencia de configuraciones
  useEffect(() => {
    const saved = localStorage.getItem('aura-settings');
    if (saved) {
      try {
        const { prompt: p, style: s, aspectRatio: a, isHighRes: h, batchCount: b } = JSON.parse(saved);
        if (p) setPrompt(p);
        if (s) setStyle(s);
        if (a) setAspectRatio(a);
        if (h !== undefined) setIsHighRes(h);
        if (b) setBatchCount(b);
      } catch (e) {
        console.error("Error loading settings", e);
      }
    }
  }, []);

  useEffect(() => {
    const settings = { prompt, style, aspectRatio, isHighRes, batchCount };
    localStorage.setItem('aura-settings', JSON.stringify(settings));
  }, [prompt, style, aspectRatio, isHighRes, batchCount]);

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
            // 1. Upload to storage (Returns public URL)
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

            if (dbError) throw dbError;
            if (dbData) dbId = dbData.id;

          } catch (err) {
            console.error("Cloud sync failed, keeping local-only for now:", err);
            // Non-blocking error for UI, but log it
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

      // 3. Update local history context (which might already be updated by real-time subscription)
      addImages(newImages);
      
      // 4. Update usage quotas via RPC
      if (user) {
        const { error: rpcError } = await supabase.rpc('increment_usage', { user_id: user.id, inc: batchCount });
        if (rpcError) console.error("Quota update error:", rpcError);
        await refreshProfile();
      }

      toast.success(batchCount > 1 ? `${batchCount} obras esculpidas` : "Obra esculpida con éxito");
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
