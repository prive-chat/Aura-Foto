import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-2">
          {referenceImage ? <Sparkles size={12} className="text-white/50" /> : <Wand2 size={12} className="text-white/50" />}
          {referenceImage ? 'Inspiración Activa' : 'Narrativa Visual'}
        </label>
        <Button 
          variant="ghost" 
          size="sm"
          disabled={isEnhancing || !prompt.trim()}
          onClick={onEnhance}
          className="h-7 px-3 text-[9px] uppercase tracking-widest text-white/50 hover:text-white transition-all gap-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5"
        >
          {isEnhancing ? (
            <>
              <Loader2 className="animate-spin" size={10} /> Optimizando...
            </>
          ) : (
            <>
              <Sparkles size={10} /> Perfeccionar
            </>
          )}
        </Button>
      </div>
      
      <div className="relative group">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe la esencia de la obra que deseas materializar..."
          className="w-full h-40 bg-white/[0.02] border border-white/5 rounded-[32px] p-6 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all resize-none custom-scrollbar leading-relaxed font-serif font-light pr-12"
        />
        <div className="absolute top-6 right-6 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
        </div>
      </div>

      <AnimatePresence>
        {referenceImage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white/[0.03] rounded-3xl border border-white/10 flex items-center gap-4 relative group glass-card">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 ring-1 ring-white/10 relative">
                <img 
                  src={referenceImage} 
                  alt="Reference" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">Guía Maestro</p>
                <p className="text-[9px] text-white/20 italic line-clamp-1 italic">Preservando la esencia visual</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClearReference}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all border border-white/5"
              >
                <X size={14} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[9px] text-white/15 text-center italic mt-4">
        Tip: Incluye detalles sobre iluminación, materiales y atmósfera para resultados vibrantes.
      </p>
    </div>
  );
}
