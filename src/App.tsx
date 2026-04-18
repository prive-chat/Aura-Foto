import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { Sidebar } from './components/layout/Sidebar';
import { MainPreview } from './components/layout/MainPreview';
import { LoginModal } from './components/auth/LoginModal';
import { useImageGeneration } from './hooks/useImageGeneration';
import { GeneratedImage } from './types';
import { Loader2 } from 'lucide-react';

/**
 * Main Application Logic
 * Encapsulated after refactoring for maximum scalability.
 */
function AuraApp() {
  const { isLoading } = useAuth();
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  
  const gen = useImageGeneration();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-studio-bg gap-6">
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

  return (
    <div className="min-h-screen bg-studio-bg text-neutral-900 font-sans selection:bg-black selection:text-white flex flex-col md:flex-row md:h-screen overflow-x-hidden md:overflow-hidden relative">
      <div className="noise-overlay" />
      
      <LoginModal />
      
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
      />

      <MainPreview 
        selectedImage={selectedImage || (gen.isGenerating ? null : null)} 
        onClose={() => setSelectedImage(null)}
        aspectRatio={gen.aspectRatio}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HistoryProvider>
        <AuraApp />
      </HistoryProvider>
    </AuthProvider>
  );
}
