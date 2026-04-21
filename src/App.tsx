import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { CharacterProvider } from './contexts/CharacterContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/layout/Sidebar';
import { MainPreview } from './components/layout/MainPreview';
import { LoginModal } from './components/auth/LoginModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { FullScreenGallery } from './components/layout/FullScreenGallery';
import { ImageLightbox } from './components/layout/ImageLightbox';
import { SEO } from './components/layout/SEO';
import { Logo } from './components/ui/Logo';
import { Toaster } from '@/components/ui/sonner';
import { useImageGeneration } from './hooks/useImageGeneration';
import { GeneratedImage } from './types';
import { Loader2 } from 'lucide-react';

/**
 * Main Application Logic
 * Encapsulated after refactoring for maximum scalability.
 */
function AuraApp() {
  const { isLoading, isAdmin } = useAuth();
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  
  const gen = useImageGeneration();

  if (isLoading) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col items-center justify-center bg-studio-bg gap-12">
        <div className="relative">
           <Logo size={120} />
           <motion.div 
             className="absolute -bottom-10 left-0 right-0 flex justify-center"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
           >
              <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-bold animate-pulse">Iniciando Estudio</p>
           </motion.div>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    const result = await gen.handleGenerate();
    if (result) {
      setSelectedImage(result);
    }
  };

  const handleVariation = (img: GeneratedImage) => {
    gen.setReferenceImage(img.url);
    gen.setPrompt(img.prompt);
    // Visual cue that we are in variation mode
  };

  return (
    <div className="fixed inset-0 bg-[#050505] text-white font-sans selection:bg-white selection:text-black flex flex-col md:flex-row overflow-hidden">
      <SEO 
        title={showGallery ? "Explorador de Auras" : "Estudio Artístico"}
        description={showGallery ? "Explora la colección completa de retratos artísticos generados por la comunidad de Aura Studio." : undefined}
      />
      <div className="atmosphere-bg" />
      <div className="noise-overlay" />
      
      <LoginModal />
      
      <AnimatePresence>
        {showGallery && (
          <FullScreenGallery 
            onClose={() => setShowGallery(false)}
            onSelectImage={(img) => {
              setSelectedImage(img);
              setShowGallery(false);
            }}
            onOpenLightbox={setLightboxImage}
            onVariation={handleVariation}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxImage && (
          <ImageLightbox 
            image={lightboxImage} 
            onClose={() => setLightboxImage(null)} 
            onImageChange={setLightboxImage}
          />
        )}
      </AnimatePresence>
      
      {showAdminPanel && isAdmin && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      <div className="flex-1 flex flex-col md:flex-row relative">
        <motion.div
          animate={{ 
            x: isZenMode ? -420 : 0,
            opacity: isZenMode ? 0 : 1,
            width: isZenMode ? 0 : 420
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="h-[100dvh] z-40 overflow-hidden"
        >
          <Sidebar 
            prompt={gen.prompt}
            setPrompt={gen.setPrompt}
            isGenerating={gen.isGenerating}
            isEnhancing={gen.isEnhancing}
            error={gen.error}
            batchCount={gen.batchCount}
            setBatchCount={gen.setBatchCount}
            isHighRes={gen.isHighRes}
            setIsHighRes={gen.setIsHighRes}
            aspectRatio={gen.aspectRatio}
            setAspectRatio={gen.setAspectRatio}
            style={gen.style}
            setStyle={gen.setStyle}
            onGenerate={handleGenerate}
            onEnhance={gen.handleEnhancePrompt}
            onSelectImage={(img) => setSelectedImage(img)}
            onOpenLightbox={setLightboxImage}
            onOpenAdmin={() => setShowAdminPanel(true)}
            referenceImage={gen.referenceImage}
            onClearReference={() => gen.setReferenceImage(null)}
            setReferenceImage={gen.setReferenceImage}
            onOpenGallery={() => setShowGallery(true)}
          />
        </motion.div>

        <div className="flex-1 relative">
          <MainPreview 
            selectedImage={selectedImage} 
            onClose={() => setSelectedImage(null)}
            aspectRatio={gen.aspectRatio}
            onVariation={handleVariation}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CharacterProvider>
          <HistoryProvider>
            <AuraApp />
            <Toaster position="top-center" expand={true} richColors />
          </HistoryProvider>
        </CharacterProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
