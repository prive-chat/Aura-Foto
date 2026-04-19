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
  Image as ImageIcon
} from 'lucide-react';
import { useHistory } from '../../contexts/HistoryContext';
import { Button } from '@/components/ui/button';
import { GeneratedImage } from '../../types';
import { toast } from 'sonner';

interface FullScreenGalleryProps {
  onClose: () => void;
  onSelectImage: (img: GeneratedImage) => void;
  onOpenLightbox?: (img: GeneratedImage) => void;
}

export function FullScreenGallery({ onClose, onSelectImage, onOpenLightbox }: FullScreenGalleryProps) {
  const { history, deleteImage, isLoading } = useHistory();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredHistory = history.filter(img => 
    img.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      className="fixed inset-0 z-[100] bg-studio-bg flex flex-col h-[100dvh]"
    >
      <div className="noise-overlay opacity-30 pointer-events-none" />
      
      {/* Navigation Header */}
      <header className="h-24 shrink-0 border-b border-black/5 px-8 md:px-12 flex items-center justify-between bg-white/50 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <h2 className="text-2xl font-serif font-light tracking-tight flex items-center gap-3">
              EXPLORADOR DE <span className="italic">AURAS</span>
            </h2>
            <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
              <span>{history.length} Obras Coleccionadas</span>
              <span className="w-1 h-1 rounded-full bg-black/10" />
              <span className="flex items-center gap-1.5"><Grid3X3 size={10} /> Mosaico</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-2xl border-black/5 h-12 px-6 gap-2 hover:bg-black hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest"
          >
            <Home size={14} /> Inicio
          </Button>
          <Button 
            onClick={onClose}
            className="rounded-2xl bg-black text-white h-12 px-6 gap-2 hover:bg-neutral-800 transition-all font-bold text-[10px] uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Volver
          </Button>
        </div>
      </header>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Search bar */}
          <div className="relative group max-w-xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-black transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar en tu colección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 bg-black/5 rounded-2xl pl-14 pr-6 text-sm font-medium outline-none border border-transparent focus:border-black/5 focus:bg-white transition-all"
            />
          </div>

          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredHistory.map((img, index) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.02 }}
                  className="aspect-[3/4] group relative rounded-2xl overflow-hidden glass-panel border border-black/5 bg-black/[0.01] flex flex-col cursor-pointer"
                  onClick={() => {
                    onSelectImage(img);
                    onClose();
                  }}
                >
                  <div className="flex-1 overflow-hidden relative">
                    <img 
                      src={img.url} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                       <Button
                        size="icon"
                        variant="ghost"
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-all shadow-lg backdrop-blur-sm"
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
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-all shadow-lg backdrop-blur-sm"
                        onClick={(e) => handleDownload(e, img)}
                      >
                        <Download size={18} />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-black/5">
                    <p className="text-[10px] text-black font-semibold line-clamp-2 italic leading-relaxed">
                      "{img.prompt}"
                    </p>
                    <div className="flex items-center gap-2 mt-3 opacity-40">
                      <Calendar size={10} />
                      <span className="text-[8px] font-bold uppercase tracking-widest">
                        {new Date(img.timestamp).toLocaleDateString()}
                      </span>
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
