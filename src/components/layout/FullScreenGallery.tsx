import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Home, 
  Download, 
  Trash2, 
  Maximize2, 
  Grid3X3, 
  Search,
  Calendar,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import { useHistory } from '../../contexts/HistoryContext';
import { Button } from '@/components/ui/button';
import { GeneratedImage } from '../../types';
import { toast } from 'sonner';
import { SmartImage } from '../ui/SmartImage';

interface FullScreenGalleryProps {
  onClose: () => void;
  onSelectImage: (img: GeneratedImage) => void;
  onOpenLightbox?: (img: GeneratedImage) => void;
  onVariation?: (img: GeneratedImage) => void;
}

export function FullScreenGallery({ onClose, onSelectImage, onOpenLightbox, onVariation }: FullScreenGalleryProps) {
  const { history, deleteImage, isLoading } = useHistory();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredHistory = history.filter(img => 
    img.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta obra permanentemente?')) {
      await deleteImage(id);
      toast.success("Imagen eliminada");
    }
  };

  const handleDownload = async (e: React.MouseEvent, img: GeneratedImage) => {
    e.stopPropagation();
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `aura-gallery-${img.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Imagen guardada");
    } catch (err) {
      toast.error("Error en descarga");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#050505] flex flex-col h-[100dvh] text-white"
    >
      <div className="atmosphere-bg opacity-50" />
      <div className="noise-overlay opacity-20 pointer-events-none" />
      
      {/* Navigation Header */}
      <header className="h-24 shrink-0 border-b border-white/5 px-8 md:px-12 flex items-center justify-between glass-2 relative z-10">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <h2 className="text-2xl font-serif font-light tracking-tight flex items-center gap-3">
              EXPLORADOR DE <span className="italic text-white/50">AURAS</span>
            </h2>
            <div className="flex items-center gap-4 text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
              <span>{history.length} Obras Coleccionadas</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span className="flex items-center gap-1.5"><Grid3X3 size={10} /> Mosaico</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-full border-white/10 glass-card h-12 px-6 gap-2 hover:bg-white hover:text-black transition-all font-bold text-[10px] uppercase tracking-widest"
          >
            <Home size={14} /> Inicio
          </Button>
          <Button 
            onClick={onClose}
            className="rounded-full bg-white text-black h-12 px-6 gap-2 hover:bg-neutral-200 transition-all font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-white/5"
          >
            <ArrowLeft size={14} /> Volver
          </Button>
        </div>
      </header>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Search bar */}
          <div className="relative group max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar en tu colección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 bg-white/5 rounded-2xl pl-14 pr-6 text-sm font-medium outline-none border border-white/5 focus:border-white/20 focus:bg-white/10 transition-all text-white"
            />
          </div>

          <AnimatePresence mode="popLayout">
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
              {filteredHistory.map((img, index) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.02 }}
                  className="break-inside-avoid relative rounded-3xl overflow-hidden glass-card border border-white/5 bg-white/[0.02] flex flex-col cursor-pointer group"
                  onClick={() => {
                    if (onOpenLightbox) {
                      onOpenLightbox(img);
                    } else {
                      onSelectImage(img);
                      onClose();
                    }
                  }}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={img.url} 
                      alt={img.prompt} 
                      className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm flex items-center justify-center gap-2">
                       <Button
                        size="icon"
                        variant="ghost"
                        title="Ver en detalle"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all shadow-lg border border-white/10"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (onOpenLightbox) {
                            onOpenLightbox(img);
                          } else {
                            onSelectImage(img); 
                            onClose();
                          }
                        }}
                      >
                        <Maximize2 size={18} />
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Cargar en Estudio"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all shadow-lg border border-white/10"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onSelectImage(img);
                          onClose();
                        }}
                      >
                        <Home size={18} />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        title="Eliminar"
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500 text-white transition-all shadow-lg border border-white/10"
                        onClick={(e) => handleDelete(e, img.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 bg-gradient-to-b from-transparent to-black/40">
                    <p className="text-[10px] text-white/90 font-serif font-light line-clamp-2 italic leading-relaxed">
                      "{img.prompt}"
                    </p>
                    <div className="flex items-center justify-between opacity-30 mt-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={10} />
                        <span className="text-[8px] font-bold uppercase tracking-widest">
                          {new Date(img.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <Layers size={10} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {filteredHistory.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center text-neutral-300">
                <ImageIcon size={32} strokeWidth={1} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-serif">Sin coincidencias</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">Prueba con otro término de búsqueda</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
