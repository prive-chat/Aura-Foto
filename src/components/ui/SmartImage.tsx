import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: '1:1' | '2:3' | '3:2' | '9:16';
  showLoading?: boolean;
  onLoad?: () => void;
  priority?: boolean;
}

/**
 * SmartImage: Enterprise-grade image component with 
 * lazy loading, blur transitions, and error handling.
 */
export function SmartImage({ 
  src, 
  alt, 
  className, 
  containerClassName,
  aspectRatio = '1:1',
  showLoading = true,
  onLoad,
  priority = false
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [blurUrl, setBlurUrl] = useState<string | null>(null);

  useEffect(() => {
    // Generate a simple low-res blur placeholder if it's a supabase URL
    if (src.includes('supabase.co')) {
      // In a real production environment, we would use Supabase Image Transformation
      // For now, we simulate a small thumbnail
      setBlurUrl(`${src}?width=50&quality=20`);
    }
  }, [src]);

  const ratioClass = {
    '1:1': 'aspect-square',
    '2:3': 'aspect-[2/3]',
    '3:2': 'aspect-[3/2]',
    '9:16': 'aspect-[9/16]'
  }[aspectRatio];

  return (
    <div className={cn(
      "relative overflow-hidden bg-neutral-100 group",
      ratioClass,
      containerClassName
    )}>
      {/* Blur Placeholder */}
      <AnimatePresence>
        {!loaded && !error && blurUrl && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            src={blurUrl}
            alt="blur"
            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
            referrerPolicy="no-referrer"
          />
        )}
      </AnimatePresence>

      {/* Loading Spinner */}
      {showLoading && !loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-10">
          <Loader2 className="animate-spin text-black/20" size={24} />
        </div>
      )}

      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
        onError={() => setError(true)}
        className={cn(
          "w-full h-full object-cover transition-all duration-700 ease-out",
          !loaded ? "opacity-0 scale-105" : "opacity-100 scale-100",
          className
        )}
        referrerPolicy="no-referrer"
      />

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 p-4 gap-2">
          <AlertCircle size={24} strokeWidth={1} />
          <span className="text-[10px] uppercase tracking-widest font-medium">Error de carga</span>
        </div>
      )}

      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
    </div>
  );
}
