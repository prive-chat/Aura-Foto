import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { CharacterProvider } from './contexts/CharacterContext';
import { Sidebar } from './components/layout/Sidebar';
import { MainPreview } from './components/layout/MainPreview';
import { LoginModal } from './components/auth/LoginModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { FullScreenGallery } from './components/layout/FullScreenGallery';
import { ImageLightbox } from './components/layout/ImageLightbox';
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
  
  const gen = useImageGeneration();

  if (isLoading) {
    return (
      <div className="h-[100dvh] w-screen flex flex-col items-center justify-center bg-studio-bg gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-black/20" size={48} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-xl font-serif font-light tracking-[0.2em] text-black">AURA</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-bold">Iniciando Estudio</p>
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
    <div className="w-full h-[100dvh] bg-studio-bg text-neutral-900 font-sans selection:bg-black selection:text-white relative overflow-hidden">
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
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxImage && (
          <ImageLightbox 
            image={lightboxImage} 
            onClose={() => setLightboxImage(null)} 
          />
        )}
      </AnimatePresence>
      
      {showAdminPanel && isAdmin && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* Main Layout Container */}
      <div className="flex flex-col md:flex-row w-full h-full relative z-10 overflow-hidden">
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

        <MainPreview 
          selectedImage={selectedImage} 
          onClose={() => setSelectedImage(null)}
          aspectRatio={gen.aspectRatio}
          onVariation={handleVariation}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CharacterProvider>
        <HistoryProvider>
          <AuraApp />
          <Toaster position="top-center" expand={true} richColors />
        </HistoryProvider>
      </CharacterProvider>
    </AuthProvider>
  );
}
