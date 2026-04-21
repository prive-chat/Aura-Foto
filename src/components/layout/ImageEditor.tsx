import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Download, 
  Layers, 
  RefreshCcw, 
  Image as ImageIcon,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneratedImage, ImageFilters } from '../../types';

interface ImageEditorProps {
  image: GeneratedImage;
  onClose: () => void;
}

const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  blur: 0
};

export function ImageEditor({ image, onClose }: ImageEditorProps) {
  const [filters, setFilters] = useState<ImageFilters>(DEFAULT_FILTERS);

  const filterStyle = {
    filter: `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturation}%) 
      grayscale(${filters.grayscale}%) 
      sepia(${filters.sepia}%) 
      blur(${filters.blur}px)
    `
  };

  const handleDownload = () => {
    // Note: Applying CSS filters to a downloaded image requires a Canvas render.
    // For now, we'll download the raw image.
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `AuraArt-${image.id.substring(0, 8)}.png`;
    link.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-[#050505] flex flex-col md:flex-row overflow-hidden"
    >
      <div className="atmosphere-bg opacity-30" />
      <div className="noise-overlay opacity-20 pointer-events-none" />

      {/* Sidebar Editor */}
      <div className="w-full md:w-96 border-r border-white/5 p-10 flex flex-col gap-10 glass-2 z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-light text-white tracking-tight italic">Refinar Aura</h2>
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">Laboratorio de Luz</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl bg-white/5 text-white/40 hover:bg-white hover:text-black hover:scale-105 transition-all">
            <RefreshCcw size={18} className="rotate-45" />
          </Button>
        </div>

        <Tabs defaultValue="adjust" className="w-full">
          <TabsList className="w-full bg-white/5 border border-white/5 rounded-full p-1 h-12">
            <TabsTrigger value="adjust" className="flex-1 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold text-white/40 data-[state=active]:bg-white data-[state=active]:text-black transition-all">Ajustes</TabsTrigger>
            <TabsTrigger value="info" className="flex-1 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold text-white/40 data-[state=active]:bg-white data-[state=active]:text-black transition-all">Detalles</TabsTrigger>
          </TabsList>

          <TabsContent value="adjust" className="py-8 space-y-8">
            {[
              { id: 'brightness', label: 'Brillo', min: 0, max: 200 },
              { id: 'contrast', label: 'Contraste', min: 0, max: 200 },
              { id: 'saturation', label: 'Saturación', min: 0, max: 200 },
              { id: 'blur', label: 'Desenfoque', min: 0, max: 10 },
              { id: 'grayscale', label: 'Blanco y Negro', min: 0, max: 100 },
              { id: 'sepia', label: 'Sepia', min: 0, max: 100 },
            ].map((f) => (
              <div key={f.id} className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.1em] text-white/40 font-bold font-sans">
                  <span>{f.label}</span>
                  <span className="text-white">{(filters as any)[f.id]}</span>
                </div>
                <Slider 
                  value={[(filters as any)[f.id]]} 
                  min={f.min} 
                  max={f.max} 
                  step={1}
                  onValueChange={(val) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    setFilters(prev => ({ ...prev, [f.id]: v }));
                  }}
                />
              </div>
            ))}

            <Button 
              variant="outline" 
              className="w-full h-12 rounded-2xl border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all text-[9px] uppercase tracking-widest font-bold"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Resetear Ajustes
            </Button>
          </TabsContent>

          <TabsContent value="info" className="py-8 space-y-6">
            <div className="p-6 bg-white/5 rounded-[28px] border border-white/5 space-y-3">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Concepto Artístico</p>
              <p className="text-sm italic leading-relaxed text-white/70 font-serif">"{image.prompt}"</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold mb-1">Identidad</p>
                <p className="text-[10px] font-mono text-white/50">{image.id.substring(0, 10)}</p>
              </div>
              <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold mb-1">Captura</p>
                <p className="text-[10px] text-white/50 font-bold">{new Date(image.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-auto pt-6 border-t border-white/5">
          <Button 
            onClick={handleDownload}
            className="w-full h-16 bg-white text-black rounded-3xl font-bold uppercase tracking-[0.2em] text-[10px] gap-3 hover:bg-neutral-200 transition-all shadow-2xl shadow-white/5"
          >
            <Download size={18} /> Guardar Edición
          </Button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 md:p-20">
        <div className="absolute inset-0 bg-studio-bg overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-white/[0.02] rounded-full blur-[140px]" />
        </div>

        <motion.div 
          layoutId={`img-${image.id}`}
          className="relative max-w-full max-h-full aspect-auto shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] rounded-[48px] overflow-hidden border border-white/10"
        >
          <img 
            src={image.url} 
            alt="Preview" 
            style={filterStyle} 
            className="w-full h-full object-contain transition-all duration-300"
            referrerPolicy="no-referrer"
          />
          
          {/* Subtle Corner Accents */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </motion.div>
  );
}
