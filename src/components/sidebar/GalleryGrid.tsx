import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Trash2, CloudOff, Download, Maximize2, AlertCircle } from 'lucide-react';
import { useHistory } from '../../contexts/HistoryContext';
import { GeneratedImage } from '../../types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GalleryGridProps {
  onSelectImage: (img: GeneratedImage) => void;
  onOpenGallery?: () => void;
  onOpenLightbox?: (img: GeneratedImage) => void;
}

export function GalleryGrid({ onSelectImage, onOpenGallery, onOpenLightbox }: GalleryGridProps) {
  const { history, clearHistory, deleteImage, loadMore, hasMore, isLoading } = useHistory();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (e: React.MouseEvent, img: GeneratedImage) => {
    e.stopPropagation();
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
      toast.success("Imagen descargada");
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Error al descargar");
    }
  };

  const handleConfirmDelete = async (e: React.MouseEvent, img: GeneratedImage) => {
    e.stopPropagation();
    try {
      await deleteImage(img.id, img.url);
      toast.success("Imagen eliminada");
      setDeletingId(null);
    } catch (error) {
      toast.error("Error al eliminar");
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

  const GallerySkeleton = () => (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i} 
          className="aspect-square rounded-xl bg-black/[0.03] animate-pulse overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-2">
          Galería del Estudio
        </label>
        <div className="flex items-center gap-2">
          {onOpenGallery && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onOpenGallery}
              className="h-7 px-2 text-[9px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors gap-1"
            >
              <Maximize2 size={10} /> Expandir
            </Button>
          )}
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
      </div>

      <div className="grid grid-cols-3 gap-3">
        {history.length === 0 && isLoading ? (
          <GallerySkeleton />
        ) : (
          <AnimatePresence mode="popLayout">
            {history.map((img, index) => (
              <motion.div
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
                className="aspect-square rounded-xl overflow-hidden border border-black/5 bg-black/[0.01] flex items-center justify-center relative group active:scale-95 transition-transform cursor-pointer"
              >
                <img 
                  src={img.url} 
                  alt="Thumbnail" 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-2 text-center">
                  {deletingId === img.id ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <AlertCircle className="text-red-400" size={20} />
                      <p className="text-[8px] text-white font-bold uppercase tracking-tighter leading-tight">
                        ¿Borrar obra?
                      </p>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 px-2 text-[8px] rounded-md"
                          onClick={(e) => handleConfirmDelete(e, img)}
                        >
                          SÍ
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 px-2 text-[8px] rounded-md text-black"
                          onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                        >
                          NO
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-all shadow-lg"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (onOpenLightbox) {
                            onOpenLightbox(img);
                          } else {
                            onSelectImage(img);
                          }
                        }}
                      >
                        <Maximize2 size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-all shadow-lg"
                        onClick={(e) => handleDownload(e, img)}
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-red-500 text-white transition-all shadow-lg"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setDeletingId(img.id); 
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
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
