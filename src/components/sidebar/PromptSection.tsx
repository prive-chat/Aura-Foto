import React from 'react';
import { Sparkles, Wand2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromptSectionProps {
  prompt: string;
  setPrompt: (v: string) => void;
  isEnhancing: boolean;
  onEnhance: () => void;
  referenceImage?: string | null;
  onClearReference?: () => void;
}

export function PromptSection({ 
  prompt, 
  setPrompt, 
  isEnhancing, 
  onEnhance,
  referenceImage,
  onClearReference
}: PromptSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-2">
          <Sparkles size={14} /> {referenceImage ? 'Generando Variación' : 'Descripción del Retrato'}
        </label>
        {referenceImage && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearReference}
            className="h-6 px-2 text-[8px] uppercase tracking-widest text-red-400 hover:text-red-500 hover:bg-red-50"
          >
            Cancelar Variación
          </Button>
        )}
      </div>

      {referenceImage && (
        <div className="relative w-20 aspect-[3/4] rounded-lg overflow-hidden border border-black/10 group">
          <img 
            src={referenceImage} 
            alt="Reference" 
            className="w-full h-full object-cover blur-[1px] group-hover:blur-0 transition-all" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <Sparkles size={12} className="text-white animate-pulse" />
          </div>
        </div>
      )}

      <div className="relative group">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Mujer elegante en un vestido de seda, luz de atardecer..."
          className="w-full bg-black/5 border border-black/5 rounded-2xl p-5 pr-14 text-sm focus:outline-none focus:border-black/10 transition-all min-h-[140px] resize-none leading-relaxed placeholder:text-neutral-400 font-light text-black"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onEnhance}
          disabled={isEnhancing || !prompt.trim()}
          className="absolute top-4 right-4 h-9 w-9 bg-black/5 hover:bg-black text-neutral-400 hover:text-white rounded-xl transition-all border border-black/5 hover:border-black disabled:opacity-30"
          title="Mejorar con IA (Magic Prompt)"
        >
          {isEnhancing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
        </Button>
        <div className="absolute bottom-4 right-4 text-[10px] text-neutral-600 font-mono">
          {prompt.length} / 500
        </div>
      </div>
    </div>
  );
}
