import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Maximize2, 
  X, 
  Sun, 
  Wind, 
  Layers, 
  Paintbrush, 
  Sparkles,
  Download,
  Share2
} from 'lucide-react';
import { GeneratedImage } from '../../types';
import { ImageEditor } from './ImageEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MainPreviewProps {
  selectedImage: GeneratedImage | null;
  onClose: () => void;
  aspectRatio: string;
  onVariation: (image: GeneratedImage) => void;
}

export function MainPreview({ selectedImage, onClose, aspectRatio, onVariation }: MainPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <main className="flex-1 bg-studio-bg flex flex-col items-center p-4 md:p-12 relative min-h-0 h-full overflow-y-auto custom-scrollbar">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[30%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-black/[0.03] rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[20%] right-[30%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-black/[0.03] rounded-full blur-[80px] md:blur-[120px]" />
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10 py-8">
        <AnimatePresence mode="wait">
        {selectedImage ? (
          <motion.div
            key={selectedImage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full h-full flex flex-col items-center justify-center max-w-4xl"
          >
            <div className="relative group w-full flex flex-col items-center">
              <div 
                className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden glass-panel border border-black/5"
                style={{ 
                  aspectRatio: aspectRatio.replace(':', '/'),
                  width: 'min(100%, 600px)',
                  maxHeight: '70vh'
                }}
              >
                <img 
                  src={selectedImage.url} 
                  alt="Preview"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm flex items-center justify-center gap-4">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-black hover:bg-neutral-100 rounded-full h-14 px-8 gap-2 font-bold uppercase tracking-widest text-[10px]"
                  >
                    <Paintbrush size={16} /> Abrir Editor
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onVariation(selectedImage)}
                    className="bg-white/10 text-white hover:bg-white/20 border-white/20 rounded-full h-14 px-8 gap-2 font-bold uppercase tracking-widest text-[10px]"
                  >
                    <Sparkles size={16} /> Crear Variación
                  </Button>
                </div>
              </div>
              
              <div className="pt-8 text-center space-y-6 max-w-xl">
                <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                  <Badge variant="outline" className="rounded-full bg-white/50 text-neutral-400 border-black/5 text-[8px] uppercase tracking-tighter">Proceso Gemini</Badge>
                  {selectedImage.isFeatured && <Badge variant="default" className="rounded-full bg-black text-white text-[8px] uppercase tracking-tighter">Destacado</Badge>}
                </div>

                <p className="text-sm md:text-xl text-black font-serif italic leading-relaxed tracking-tight px-4">
                  "{selectedImage.prompt}"
                </p>

                <div className="flex items-center justify-center gap-8 pt-4">
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 hover:text-black transition-colors">
                    <Maximize2 size={14} /> Detalle
                  </button>
                  <button onClick={() => onVariation(selectedImage)} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 hover:text-black transition-colors">
                    <Sparkles size={14} /> Refinar
                  </button>
                  <button onClick={onClose} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-300 hover:text-red-400 transition-colors">
                    <X size={14} /> Descartar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-12 max-w-md"
          >
            <div className="relative w-32 h-32 mx-auto">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border border-black/[0.05] rounded-[40px] border-dashed"
              />
              <div className="absolute inset-0 flex items-center justify-center text-neutral-200">
                <ImageIcon size={40} strokeWidth={1} />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-serif font-light tracking-tight text-neutral-900">
                Tu Visión <br />
                <span className="italic text-neutral-400">Hecha Arte.</span>
              </h2>
              <p className="text-neutral-500 font-sans text-xs tracking-widest uppercase font-bold opacity-60">
                AURA Studio v2.0 Enterprise
              </p>
            </div>
            <div className="flex justify-center gap-10 text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold border-t border-black/[0.05] pt-10">
              <span className="flex flex-col items-center gap-3">
                <Sun size={14} strokeWidth={1} /> LUZ
              </span>
              <span className="flex flex-col items-center gap-3">
                <Wind size={14} strokeWidth={1} /> TEXTURA
              </span>
              <span className="flex flex-col items-center gap-3">
                <Layers size={14} strokeWidth={1} /> CAPAS
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Professional Image Editor Modal */}
      <AnimatePresence>
        {isEditing && selectedImage && (
          <ImageEditor 
            image={selectedImage} 
            onClose={() => setIsEditing(false)} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}
