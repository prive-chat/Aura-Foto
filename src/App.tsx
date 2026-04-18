/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Layers, 
  Wind, 
  Sun, 
  Camera, 
  Download, 
  History, 
  Settings2,
  ChevronRight,
  X,
  Loader2,
  Trash2,
  Plus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { generateArtisticPortrait, ImageGenerationParams } from './lib/gemini';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<ImageGenerationParams['aspectRatio']>('3:4');
  const [style, setStyle] = useState('Glamour Cinematográfico');
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  // Cargar historial al iniciar
  useEffect(() => {
    try {
      const savedHistory = typeof window !== 'undefined' ? localStorage.getItem('aura_history_v1') : null;
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Error al cargar el historial:", e);
    }
  }, []);

  // Guardar historial cuando cambie (limitado a los últimos 3 para evitar límites de almacenamiento de base64)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && history.length > 0) {
        // Reducimos el límite drásticamente para evitar QuotaExceededError
        const limitedHistory = history.slice(0, 3);
        try {
          localStorage.setItem('aura_history_v1', JSON.stringify(limitedHistory));
        } catch (quotaError) {
          // Fallback agresivo: solo guardar la última imagen si el espacio es muy limitado
          console.warn("Espacio insuficiente, guardando solo la imagen más reciente.");
          localStorage.setItem('aura_history_v1', JSON.stringify(history.slice(0, 1)));
        }
      }
    } catch (e) {
      console.error("Error al gestionar el almacenamiento:", e);
    }
  }, [history]);

  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = [
    'Glamour Cinematográfico',
    'Retrato Fine Art',
    'Editorial de Moda',
    'Etéreo y Onírico',
    'Blanco y Negro Clásico',
    'Iluminación de Humor',
    'Estética Vogue',
    'Estudio Minimalista',
  ];

  const aspectRatios: { label: string; value: ImageGenerationParams['aspectRatio'] }[] = [
    { label: 'Cuadrado (1:1)', value: '1:1' },
    { label: 'Retrato (3:4)', value: '3:4' },
    { label: 'Cinematográfico (16:9)', value: '16:9' },
    { label: 'Social (9:16)', value: '9:16' },
    { label: 'Paisaje (4:3)', value: '4:3' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateArtisticPortrait({
        prompt: prompt.trim(),
        aspectRatio,
        style
      });

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
      };

      setHistory(prev => [newImage, ...prev]);
      setSelectedImage(newImage);
    } catch (err) {
      setError('Hubo un error al generar la imagen. Por favor, intenta con un prompt diferente o asegúrate de cumplir con las políticas de contenido.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(img => img.id !== id));
    if (selectedImage?.id === id) setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-studio-bg text-white font-sans selection:bg-white selection:text-black flex flex-col md:flex-row md:h-screen overflow-x-hidden md:overflow-hidden relative">
      <div className="noise-overlay" />
      
      {/* Mobile Header */}
      <header className="md:hidden p-4 border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-light tracking-wider">
            AURA <span className="text-neutral-500 font-sans text-xs tracking-widest uppercase">Studio</span>
          </h1>
        </div>
        <button onClick={() => setHistory([])} className="p-2 text-neutral-600 hover:text-white transition-colors">
          <History size={18} />
        </button>
      </header>

      {/* Main Content Area - Mobile Order Prioritization */}
      <main className="order-1 md:order-2 flex-1 bg-black flex items-center justify-center p-4 md:p-12 relative min-h-[50vh] md:min-h-0 overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[30%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-neutral-900/20 rounded-full blur-[80px] md:blur-[120px]" />
          <div className="absolute bottom-[20%] right-[30%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-neutral-800/10 rounded-full blur-[80px] md:blur-[120px]" />
        </div>

        <AnimatePresence mode="wait">
          {selectedImage ? (
            <motion.div
              key={selectedImage.id}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full flex flex-col items-center justify-center group"
            >
              <div className="relative shadow-[0_0_100px_rgba(255,255,255,0.05)] rounded-lg overflow-hidden border border-white/10 glass-panel w-full md:w-auto overflow-hidden group/img"
                style={{ 
                  aspectRatio: aspectRatio.replace(':', '/'),
                  maxHeight: '100%',
                  height: 'auto'
                }}
              >
                <div className="md:h-[calc(100vh-160px)] flex items-center justify-center bg-black/20">
                  <img 
                    src={selectedImage.url} 
                    alt="Generación artística"
                    className="w-full h-full object-contain max-h-[70vh] md:max-h-full transition-transform duration-1000 group-hover/img:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-8 md:p-12">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <p className="text-sm md:text-lg text-white/90 font-serif italic leading-relaxed max-w-2xl">"{selectedImage.prompt}"</p>
                    <div className="flex gap-6 items-center">
                      <button 
                        onClick={() => setIsFullScreen(true)}
                        className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white hover:text-neutral-300 transition-all font-bold group/btn"
                      >
                        <Maximize2 size={14} className="group-hover/btn:scale-125 transition-transform" /> <span>Enfoque Total</span>
                      </button>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = selectedImage.url;
                          link.download = `aura-studio-${selectedImage.id}.png`;
                          link.click();
                        }}
                        className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white hover:text-neutral-300 transition-all font-bold group/btn"
                      >
                        <Download size={14} className="group-hover/btn:translate-y-0.5 transition-transform" /> <span>Guardar Obra</span>
                      </button>
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="ml-auto flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-all font-bold"
                      >
                        <X size={14} /> <span>Cerrar</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6 md:space-y-8 max-w-md px-6 py-12 md:py-0"
            >
              <div className="relative w-16 h-16 md:w-24 md:h-24 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border border-neutral-800 rounded-full border-dashed"
                />
                <div className="absolute inset-0 flex items-center justify-center text-neutral-800">
                  <ImageIcon size={28} className="md:hidden" />
                  <ImageIcon size={32} className="hidden md:block" />
                </div>
              </div>
              <div className="space-y-3 md:space-y-4">
                <h2 className="text-3xl md:text-4xl font-serif font-light tracking-tight leading-tight">
                  Inicia tu <span className="italic">Vision Artística</span>
                </h2>
                <p className="text-neutral-500 text-xs md:text-sm leading-relaxed">
                  Describe una estética, una iluminación y una mujer. Aura transformará tus palabras en un retrato digital de alta costura.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">
                <span className="flex items-center gap-2"><Sun size={12} /> Luz Natural</span>
                <span className="flex items-center gap-2"><Wind size={12} /> Atmósfera</span>
                <span className="flex items-center gap-2"><Layers size={12} /> Texturas</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sidebar - Controls */}
      <aside className="order-2 md:order-1 w-full md:w-[400px] glass-panel p-8 flex flex-col gap-10 md:overflow-y-auto shrink-0 z-40">
        <div className="hidden md:block">
          <h1 className="text-4xl font-serif font-light tracking-wide flex items-center gap-2 mb-2">
            AURA <span className="text-neutral-500 font-sans text-sm tracking-[0.3em] uppercase">Studio</span>
          </h1>
          <p className="text-label">Generador de Retratos Artísticos</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-label flex items-center gap-2">
              <Sparkles size={14} /> Descripción del Retrato
            </label>
            <div className="relative group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Mujer elegante en un vestido de seda, luz de atardecer, mirada misteriosa, realismo fotográfico..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm focus:outline-none focus:border-white/30 transition-all min-h-[140px] resize-none leading-relaxed placeholder:text-neutral-700 font-light"
              />
              <div className="absolute bottom-4 right-4 text-[10px] text-neutral-600 font-mono">
                {prompt.length} / 500
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-label flex items-center gap-2">
              <Layers size={14} /> Estilo Artístico
            </label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-4 py-3 rounded-xl border text-[10px] uppercase tracking-wider transition-all duration-500 relative overflow-hidden group ${
                    style === s 
                    ? 'bg-white text-black border-white font-bold' 
                    : 'bg-white/5 border-white/5 text-neutral-500 hover:border-white/20'
                  }`}
                >
                  <span className="relative z-10">{s}</span>
                  {style === s && (
                    <motion.div 
                      layoutId="activeStyle"
                      className="absolute inset-0 bg-white"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-label flex items-center gap-2">
              <Camera size={14} /> Relación de Aspecto
            </label>
            <div className="flex flex-wrap gap-2">
              {aspectRatios.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setAspectRatio(r.value)}
                  className={`px-4 py-2 rounded-full border text-[10px] uppercase tracking-widest transition-all duration-300 ${
                    aspectRatio === r.value 
                    ? 'bg-neutral-800 text-white border-neutral-700' 
                    : 'bg-white/5 border-transparent text-neutral-500 hover:bg-white/10'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full h-16 bg-white text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] group overflow-hidden relative shadow-xl shadow-white/5"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Esculpiendo...</span>
              </>
            ) : (
              <>
                <span>Crear Retrato</span>
                <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform duration-500" />
              </>
            )}
          </button>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs text-center leading-relaxed px-4 py-2 bg-red-950/20 border border-red-900/30 rounded-lg"
            >
              {error}
            </motion.p>
          )}
        </div>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-label">Galería Reciente</h3>
            <button 
              onClick={() => {
                setHistory([]);
                localStorage.removeItem('aura_history_v1');
              }}
              className="text-[9px] uppercase tracking-widest text-neutral-600 hover:text-white transition-colors"
            >
              Borrar Todo
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 pb-8">
            {history.slice(0, 12).map((img, index) => (
              <motion.button
                key={img.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedImage(img)}
                className={`aspect-square rounded-xl overflow-hidden border transition-all duration-500 relative group ${
                  selectedImage?.id === img.id 
                  ? 'border-white ring-2 ring-white/20' 
                  : 'border-white/5 hover:border-white/30'
                }`}
              >
                <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(img);
                      setIsFullScreen(true);
                    }}
                    className="p-2 bg-white/10 hover:bg-white rounded-full text-white hover:text-black transition-all transform scale-75 group-hover:scale-100"
                  >
                    <Maximize2 size={12} />
                  </div>
                </div>
              </motion.button>
            ))}
            {Array.from({ length: Math.max(0, 8 - history.length) }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-center">
                <Plus size={10} className="text-neutral-800" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Full Screen Overlay */}
      <AnimatePresence>
        {isFullScreen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <img 
                src={selectedImage.url} 
                alt="Vista completa" 
                className="max-w-full max-h-full object-contain shadow-2xl shadow-white/5"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute top-0 left-0 right-0 p-10 flex items-center justify-end bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex gap-6 items-center">
                  <div className="flex flex-col items-end mr-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Aura Studio</span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">Edición Galería</span>
                  </div>
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedImage.url;
                      link.download = `aura-studio-${selectedImage.id}.png`;
                      link.click();
                    }}
                    className="p-5 bg-white/5 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-2xl border border-white/10 transition-all transform hover:scale-110 active:scale-95 shadow-2xl"
                    title="Descargar"
                  >
                    <Download size={24} />
                  </button>
                  <button 
                    onClick={() => setIsFullScreen(false)}
                    className="p-5 bg-white/5 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-2xl border border-white/10 transition-all transform hover:scale-110 active:scale-95 shadow-2xl"
                    title="Cerrar"
                  >
                    <Minimize2 size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Settings Button (Desktop Only) */}
      <div className="absolute top-6 right-6 hidden md:block">
        <button className="p-3 bg-neutral-900/50 hover:bg-neutral-800/80 backdrop-blur-md rounded-full border border-neutral-800 transition-all text-neutral-400 hover:text-white">
          <Settings2 size={18} />
        </button>
      </div>
    </div>
  );
}
