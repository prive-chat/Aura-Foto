import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, ZoomIn, ZoomOut } from 'lucide-react';
import { GeneratedImage } from '../../types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageLightboxProps {
  image: GeneratedImage;
  onClose: () => void;
}

export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center cursor-pointer"
      onClick={onClose}
    >
      <div className="absolute top-6 right-6 z-10">
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-white/20 hover:text-white h-10 w-10 hover:bg-white/5 rounded-full transition-colors"
        >
          <X size={24} />
        </Button>
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full h-full p-4 flex items-center justify-center pointer-events-none"
      >
        <img
          src={image.url}
          alt="Full Preview"
          className="max-w-full max-h-full object-contain shadow-2xl"
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </motion.div>
  );
}
