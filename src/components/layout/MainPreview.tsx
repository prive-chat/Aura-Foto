import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Maximize2, Download, X, Sliders, Minimize2, Sun, Wind, Layers } from 'lucide-react';
import { GeneratedImage, ImageFilters } from '../../types';

interface MainPreviewProps {
  selectedImage: GeneratedImage | null;
  onClose: () => void;
  aspectRatio: string;
}

export function MainPreview({ selectedImage, onClose, aspectRatio }: MainPreviewProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0
  });

  return (
    <main className="order-1 md:order-2 flex-1 bg-studio-bg flex items-center justify-center p-4 md:p-12 relative min-h-[50vh] md:min-h-0 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-black/5 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[20%] right-[30%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-black/5 rounded-full blur-[80px] md:blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {selectedImage ? (
          <motion.div
            key={selectedImage.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative w-full h-full flex flex-col items-center justify-center"
          >
            <div 
              className="relative shadow-2xl rounded-lg overflow-hidden border border-black/5 glass-panel"
              style={{ aspectRatio: aspectRatio.replace(':', '/') }}
            >
              <img 
                src={selectedImage.url} 
                alt="Preview"
                className="w-full h-full object-contain"
                style={{
                  filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%)`
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="mt-8 w-full max-w-2xl text-center space-y-4">
              <p className="text-sm md:text-lg text-black/80 font-serif italic italic leading-relaxed">"{selectedImage.prompt}"</p>
              <div className="flex gap-6 items-center justify-center">
                <button 
                  onClick={() => setIsFullScreen(true)}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-black hover:text-neutral-500 transition-all font-bold"
                >
                  <Maximize2 size={14} /> <span>Pantalla Completa</span>
                </button>
                <button 
                  onClick={onClose}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-all font-bold"
                >
                  <X size={14} /> <span>Cerrar</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-8 max-w-md"
          >
            <div className="relative w-24 h-24 mx-auto">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border border-neutral-200 rounded-full border-dashed"
              />
              <div className="absolute inset-0 flex items-center justify-center text-neutral-200">
                <ImageIcon size={32} />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-serif font-light tracking-tight">Crea tu <span className="italic">Obra Maestra</span></h2>
              <p className="text-neutral-500 text-sm leading-relaxed">Describe tu visión en el panel lateral y Aura Studio la traerá a la vida.</p>
            </div>
            <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
              <span className="flex items-center gap-2"><Sun size={12} /> Luz</span>
              <span className="flex items-center gap-2"><Wind size={12} /> Textura</span>
              <span className="flex items-center gap-2"><Layers size={12} /> Estilo</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Overlay Integration */}
      <AnimatePresence>
        {isFullScreen && selectedImage && (
          <FullScreenView 
            image={selectedImage} 
            filters={filters} 
            setFilters={setFilters} 
            onClose={() => setIsFullScreen(false)} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function FullScreenView({ image, filters, setFilters, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex items-center justify-center p-12"
    >
      <img 
        src={image.url} 
        alt="Full view" 
        className="max-w-full max-h-full object-contain shadow-2xl"
        style={{
          filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%)`
        }}
        referrerPolicy="no-referrer"
      />
      
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-8 bg-black/5 p-6 rounded-3xl border border-black/5 hidden md:flex min-w-[220px]">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold mb-4">
            <span className="flex items-center gap-2"><Sliders size={12} /> Post-Producción</span>
            <button onClick={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, grayscale: 0 })} className="hover:text-black">Reset</button>
          </div>
          <div className="space-y-6">
            <FilterRange label="Brillo" value={filters.brightness} min={50} max={150} onChange={(v) => setFilters((f: any) => ({ ...f, brightness: v }))} />
            <FilterRange label="Contraste" value={filters.contrast} min={50} max={150} onChange={(v) => setFilters((f: any) => ({ ...f, contrast: v }))} />
            <FilterRange label="Saturación" value={filters.saturation} min={0} max={200} onChange={(v) => setFilters((f: any) => ({ ...f, saturation: v }))} />
            <FilterRange label="B/N" value={filters.grayscale} min={0} max={100} onChange={(v) => setFilters((f: any) => ({ ...f, grayscale: v }))} />
          </div>
        </div>
      </div>

      <div className="absolute top-10 right-10 flex gap-4">
        <button 
          onClick={onClose}
          className="p-5 bg-black/5 hover:bg-black text-black hover:text-white rounded-full transition-all border border-black/5"
        >
          <Minimize2 size={24} />
        </button>
      </div>
    </motion.div>
  );
}

function FilterRange({ label, value, min, max, onChange }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[9px] uppercase font-bold text-neutral-500">
        <span>{label}</span> <span>{value}%</span>
      </div>
      <input 
        type="range" min={min} max={max} value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))} 
        className="w-full h-1 bg-black/10 rounded-full appearance-none accent-black" 
      />
    </div>
  );
}
