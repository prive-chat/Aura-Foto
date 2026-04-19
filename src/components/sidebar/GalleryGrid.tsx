import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Trash2, CloudOff, Download, Maximize2 } from 'lucide-react';
import { useHistory } from '../../contexts/HistoryContext';
import { GeneratedImage } from '../../types';
import { Button } from '@/components/ui/button';

interface GalleryGridProps {
  onSelectImage: (img: GeneratedImage) => void;
}

export function GalleryGrid({ onSelectImage }: GalleryGridProps) {
  const { history, clearHistory, deleteImage, loadMore, hasMore, isLoading } = useHistory();
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (img: GeneratedImage) => {
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `aura-${img.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, img: GeneratedImage) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta obra permanentemente?')) {
      await deleteImage(img.id, img.url);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-2">
          Galería del Estudio
        </label>
        {history.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearHistory}
            className="h-7 px-2 text-[9px] uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-colors gap-1"
          >
            <Trash2 size={10} /> Borrar Todo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {history.map((img, index) => (
            <motion.button
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                duration: 0.4,
                delay: index < 12 ? index * 0.05 : 0 
              }}
              onClick={() => onSelectImage(img)}
              className="aspect-square rounded-xl overflow-hidden border border-black/5 bg-black/[0.01] flex items-center justify-center relative group active:scale-95 transition-transform"
            >
              <img 
                src={img.url} 
                alt="Thumbnail" 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white text-white hover:text-black transition-all"
                  onClick={(e) => { e.stopPropagation(); onSelectImage(img); }}
                >
                  <Maximize2 size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white text-white hover:text-black transition-all"
                  onClick={(e) => { e.stopPropagation(); handleDownload(img); }}
                >
                  <Download size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-red-500 text-white transition-all"
                  onClick={(e) => handleDelete(e, img)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {history.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-30">
          <CloudOff size={32} />
          <p className="text-[10px] uppercase tracking-widest font-bold">Sin obras recientes</p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      <div ref={loaderRef} className="py-8 flex justify-center">
        {isLoading && hasMore && (
          <Loader2 className="animate-spin text-neutral-300" size={24} />
        )}
        {!hasMore && history.length > 0 && (
          <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-300 font-bold">
            Fin de la colección
          </p>
        )}
      </div>
    </div>
  );
}
