import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X, Download, ChevronLeft, ChevronRight, Info, Maximize, Minimize } from 'lucide-react';
import { GeneratedImage } from '../../types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useHistory } from '../../contexts/HistoryContext';

interface ImageLightboxProps {
  image: GeneratedImage;
  onClose: () => void;
  onImageChange: (img: GeneratedImage) => void;
}

export function ImageLightbox({ image, onClose, onImageChange }: ImageLightboxProps) {
  const { history } = useHistory();
  const [isZenMode, setIsZenMode] = useState(false);
  
  const currentIndex = history.findIndex(img => img.id === image.id);
  const total = history.length;

  const navigate = useCallback((direction: number) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < total) {
      onImageChange(history[newIndex]);
    }
  }, [currentIndex, total, history, onImageChange]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsZenMode(true);
    } else {
      document.exitFullscreen();
      setIsZenMode(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'f') toggleFullscreen();
      if (e.key === 'z') setIsZenMode(!isZenMode);
      if (e.key === 'Escape') {
        if (isZenMode) {
          setIsZenMode(false);
          if (document.fullscreenElement) document.exitFullscreen();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onClose, isZenMode]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      navigate(-1);
    } else if (info.offset.x < -swipeThreshold) {
      navigate(1);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aura-${image.id}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Error al descargar");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-2xl flex items-center justify-center h-[100dvh] overflow-hidden select-none"
      onClick={() => isZenMode ? setIsZenMode(false) : onClose()}
    >
      <div className="noise-overlay opacity-20 pointer-events-none" />

      {/* Header / Actions */}
      <AnimatePresence>
        {!isZenMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/60 to-transparent"
          >
            <div className="flex flex-col">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Explorador de Arte</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-white font-medium bg-white/10 px-2 py-0.5 rounded-full">
                  {currentIndex + 1} <span className="text-white/30 mx-1">/</span> {total}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); setIsZenMode(true); }}
                className="text-white/40 hover:text-white h-11 w-11 hover:bg-white/5 rounded-full transition-all active:scale-95"
                title="Modo Zen (Limpio)"
              >
                <Maximize size={20} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDownload}
                className="text-white/40 hover:text-white h-11 w-11 hover:bg-white/5 rounded-full transition-all active:scale-95"
              >
                <Download size={20} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-white/40 hover:text-white h-11 w-11 hover:bg-white/5 rounded-full transition-all active:scale-95 border border-white/5"
              >
                <X size={24} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Navigation Arrows */}
      <AnimatePresence>
        {!isZenMode && (
          <>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute left-8 top-1/2 -translate-y-1/2 z-50 hidden md:block"
            >
              <Button
                size="icon"
                variant="ghost"
                disabled={currentIndex <= 0}
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="h-14 w-14 rounded-full bg-white/5 hover:bg-white text-white/40 hover:text-black transition-all disabled:opacity-0"
              >
                <ChevronLeft size={32} strokeWidth={1.5} />
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-8 top-1/2 -translate-y-1/2 z-50 hidden md:block"
            >
              <Button
                size="icon"
                variant="ghost"
                disabled={currentIndex >= total - 1}
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                className="h-14 w-14 rounded-full bg-white/5 hover:bg-white text-white/40 hover:text-black transition-all disabled:opacity-0"
              >
                <ChevronRight size={32} strokeWidth={1.5} />
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Image Stage */}
      <div className="relative w-full h-full flex items-center justify-center p-0 md:p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.1, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag={isZenMode ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={`w-full h-full flex flex-col items-center justify-center ${isZenMode ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isZenMode) setIsZenMode(false);
            }}
          >
            <img
              src={image.url}
              alt="Artistic Portrait"
              className={`object-contain shadow-[0_0_150px_rgba(255,255,255,0.03)] rounded-sm pointer-events-none transition-all duration-700 ${
                isZenMode ? 'max-w-full max-h-full' : 'max-w-[95%] max-h-[80vh]'
              }`}
              referrerPolicy="no-referrer"
            />
            
            <AnimatePresence>
              {!isZenMode && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-8 max-w-2xl text-center px-6"
                >
                  <div className="flex items-center justify-center gap-2 mb-2 text-white/20">
                    <Info size={12} />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Definición de Obra</p>
                  </div>
                  <p className="text-white/60 text-xs md:text-sm italic font-serif leading-relaxed line-clamp-3 md:line-clamp-none">
                    "{image.prompt}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Grid Indicators (Mobile) */}
      {!isZenMode && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1.5 md:hidden pointer-events-none">
          {Array.from({ length: Math.min(total, 10) }).map((_, i) => (
            <div 
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                (total > 10 ? Math.floor((currentIndex / total) * 10) : currentIndex) === i 
                ? 'w-6 bg-white' 
                : 'w-1 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}

      {/* Zen Mode Exit Hint */}
      <AnimatePresence>
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-6 right-6 md:right-10 z-50"
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); setIsZenMode(false); }}
              className="text-[9px] uppercase tracking-widest text-white/20 hover:text-white bg-black/40 backdrop-blur-md px-4 rounded-full border border-white/5"
            >
              <Minimize size={12} className="mr-2" /> Salir de Inmersión
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
