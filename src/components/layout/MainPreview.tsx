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
import { SmartImage } from '../ui/SmartImage';

interface MainPreviewProps {
  selectedImage: GeneratedImage | null;
  onClose: () => void;
  aspectRatio: string;
  onVariation: (image: GeneratedImage) => void;
  isZenMode: boolean;
  onToggleZen: () => void;
}

export function MainPreview({ 
  selectedImage, 
  onClose, 
  aspectRatio, 
  onVariation,
  isZenMode,
  onToggleZen
}: MainPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <main className="flex-1 bg-transparent flex flex-col items-center p-4 md:p-12 relative min-h-0 h-full overflow-y-auto custom-scrollbar">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-white/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-white/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Mode Toggle Button */}
      <div className="absolute top-8 right-8 z-50">
        <Button 
          variant="outline"
          size="sm"
          onClick={onToggleZen}
          className="glass-card rounded-full h-10 px-4 text-[9px] uppercase tracking-widest font-bold border-white/10 hover:border-white/40 text-white/70 hover:text-white"
        >
          {isZenMode ? (
            <>
              <Layers size={14} className="mr-2" /> Estudio Completo
            </>
          ) : (
            <>
              <Maximize2 size={14} className="mr-2" /> Modo Zen
            </>
          )}
        </Button>
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10 py-8">
        <AnimatePresence mode="wait">
        {selectedImage ? (
          <motion.div
            key={selectedImage.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full h-full flex flex-col items-center justify-center max-w-4xl"
          >
            <div className="relative group w-full flex flex-col items-center">
              <div 
                className="relative glass-card rounded-3xl overflow-hidden shadow-2xl shadow-black/50"
                style={{ 
                  aspectRatio: aspectRatio.replace(':', '/'),
                  width: 'min(100%, 640px)',
                  maxHeight: '75vh'
                }}
              >
                <SmartImage 
                  src={selectedImage.url} 
                  alt={selectedImage.prompt}
                  className="w-full h-full object-contain"
                  aspectRatio={aspectRatio as any}
                  priority
                />

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-700 backdrop-blur-md flex items-center justify-center gap-4">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-black hover:bg-neutral-200 rounded-full h-14 px-8 gap-3 font-bold uppercase tracking-widest text-[10px] transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0"
                  >
                    <Paintbrush size={16} /> Abrir Editor
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onVariation(selectedImage)}
                    className="glass-card text-white hover:bg-white/10 border-white/20 rounded-full h-14 px-8 gap-3 font-bold uppercase tracking-widest text-[10px] transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0 delay-75"
                  >
                    <Sparkles size={16} /> Crear Variación
                  </Button>
                </div>
              </div>
              
              <div className="pt-10 text-center space-y-8 max-w-2xl px-6">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Badge className="rounded-full bg-white/5 text-white/40 border-white/10 text-[9px] uppercase tracking-wider font-medium px-3">
                    Proceso Gemini High-Fidelity
                  </Badge>
                  {selectedImage.isFeatured && (
                    <Badge className="rounded-full bg-white text-black text-[9px] uppercase tracking-wider font-bold px-3">
                      Masterpiece
                    </Badge>
                  )}
                </div>

                <p className="text-xl md:text-2xl text-white/90 font-serif font-light italic leading-relaxed tracking-tight">
                  "{selectedImage.prompt}"
                </p>

                <div className="flex items-center justify-center gap-10 pt-4">
                  <button onClick={() => setIsEditing(true)} className="flex flex-col items-center gap-3 text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 hover:text-white transition-all group scale-90 hover:scale-100">
                    <div className="p-3 glass-card rounded-2xl group-hover:bg-white/10 group-hover:border-white/30"><Maximize2 size={16} /></div>
                    Detalle
                  </button>
                  <button onClick={() => onVariation(selectedImage)} className="flex flex-col items-center gap-3 text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 hover:text-white transition-all group scale-90 hover:scale-100">
                    <div className="p-3 glass-card rounded-2xl group-hover:bg-white/10 group-hover:border-white/30"><Sparkles size={16} /></div>
                    Refinar
                  </button>
                  <button onClick={onClose} className="flex flex-col items-center gap-3 text-[9px] uppercase tracking-[0.3em] font-bold text-white/20 hover:text-red-400 transition-all group scale-90 hover:scale-100">
                    <div className="p-3 glass-card rounded-2xl group-hover:bg-red-500/10 group-hover:border-red-500/30"><X size={16} /></div>
                    Descartar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-16 max-w-xl"
          >
            <div className="relative w-40 h-40 mx-auto">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border border-white/10 rounded-[48px] border-dashed"
              />
              <div className="absolute inset-0 flex items-center justify-center text-white/20">
                <ImageIcon size={48} strokeWidth={1} />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl font-serif font-light tracking-tight text-white/90">
                Tu Visión <br />
                <span className="italic text-white/40">Hecha Arte.</span>
              </h2>
              <p className="text-white/30 font-sans text-[10px] tracking-[0.4em] uppercase font-bold px-6 py-2 glass-2 rounded-full inline-block">
                AURA Studio v3.0 Ultra-High-Fidelity
              </p>
            </div>
            <div className="flex justify-center gap-12 text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold border-t border-white/5 pt-12">
              <span className="flex flex-col items-center gap-4 transition-colors hover:text-white/40 cursor-default">
                <Sun size={16} strokeWidth={1.5} /> LUZ
              </span>
              <span className="flex flex-col items-center gap-4 transition-colors hover:text-white/40 cursor-default">
                <Wind size={16} strokeWidth={1.5} /> TEXTURA
              </span>
              <span className="flex flex-col items-center gap-4 transition-colors hover:text-white/40 cursor-default">
                <Layers size={16} strokeWidth={1.5} /> CAPAS
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
