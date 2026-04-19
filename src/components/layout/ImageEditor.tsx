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
      className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-xl flex flex-col md:flex-row"
    >
      {/* Sidebar Editor */}
      <div className="w-full md:w-80 border-r border-black/5 p-8 flex flex-col gap-8 bg-white z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-light">Editor de Aura</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <RefreshCcw size={18} className="rotate-45" />
          </Button>
        </div>

        <Tabs defaultValue="adjust" className="w-full">
          <TabsList className="w-full bg-black/5 rounded-full p-1 h-10">
            <TabsTrigger value="adjust" className="flex-1 rounded-full text-[10px] uppercase tracking-widest">Ajustes</TabsTrigger>
            <TabsTrigger value="info" className="flex-1 rounded-full text-[10px] uppercase tracking-widest">Detalles</TabsTrigger>
          </TabsList>

          <TabsContent value="adjust" className="py-6 space-y-6">
            {[
              { id: 'brightness', label: 'Brillo', min: 0, max: 200 },
              { id: 'contrast', label: 'Contraste', min: 0, max: 200 },
              { id: 'saturation', label: 'Saturación', min: 0, max: 200 },
              { id: 'blur', label: 'Desenfoque', min: 0, max: 10 },
              { id: 'grayscale', label: 'Blanco y Negro', min: 0, max: 100 },
              { id: 'sepia', label: 'Sepia', min: 0, max: 100 },
            ].map((f) => (
              <div key={f.id} className="space-y-3">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  <span>{f.label}</span>
                  <span className="text-black">{(filters as any)[f.id]}%</span>
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
              className="w-full py-6 rounded-2xl border-black/10 text-xs uppercase tracking-widest"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Resetear Ajustes
            </Button>
          </TabsContent>

          <TabsContent value="info" className="py-6 space-y-4">
            <div className="p-4 bg-black/5 rounded-2xl space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold font-sans">Prompt Original</p>
              <p className="text-xs italic leading-relaxed text-neutral-600">"{image.prompt}"</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-4 bg-black/5 rounded-2xl">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold font-sans">ID</p>
                <p className="text-xs font-mono">{image.id.substring(0, 10)}</p>
              </div>
              <div className="p-4 bg-black/5 rounded-2xl">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold font-sans">Fecha</p>
                <p className="text-xs">{new Date(image.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-auto pt-6 border-t border-black/5 space-y-3">
          <Button 
            onClick={handleDownload}
            className="w-full h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] gap-2"
          >
            <Download size={16} /> Descargar Obra
          </Button>
        </div>
      </div>

      {/* Main Preview */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 md:p-20 bg-neutral-100">
        <motion.div 
          layoutId={`img-${image.id}`}
          className="relative max-w-full max-h-full aspect-auto shadow-2xl shadow-black/20 rounded-[40px] overflow-hidden"
        >
          <img 
            src={image.url} 
            alt="Preview" 
            style={filterStyle} 
            className="w-full h-full object-contain transition-all duration-300"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
