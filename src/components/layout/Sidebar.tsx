import React from 'react';
import { Plus, LogOut, LogIn, ShieldCheck, Loader2, Download as DownloadIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePWA } from '../../hooks/usePWA';
import { PromptSection } from '../sidebar/PromptSection';
import { ArtisticControls } from '../sidebar/ArtisticControls';
import { CharacterLibrary } from '../sidebar/CharacterLibrary';
import { GalleryGrid } from '../sidebar/GalleryGrid';
import { Character } from '../../types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { GeneratedImage } from '../../types';

interface SidebarProps {
  prompt: string;
  setPrompt: (v: string) => void;
  isGenerating: boolean;
  isEnhancing: boolean;
  error: string | null;
  batchCount: number;
  setBatchCount: (v: number) => void;
  isHighRes: boolean;
  setIsHighRes: (v: boolean) => void;
  aspectRatio: any;
  setAspectRatio: (v: any) => void;
  style: string;
  setStyle: (v: string) => void;
  onGenerate: () => void;
  onEnhance: () => void;
  onSelectImage: (img: GeneratedImage) => void;
  onOpenAdmin: () => void;
  referenceImage?: string | null;
  onClearReference?: () => void;
  setReferenceImage?: (v: string | null) => void;
  onOpenGallery?: () => void;
  onOpenLightbox?: (img: GeneratedImage) => void;
}

export function Sidebar(props: SidebarProps) {
  const { user, isAdmin, signOut, setShowLoginModal } = useAuth();
  const { canInstall, install } = usePWA();

  return (
    <aside className="order-2 md:order-1 w-full md:w-[420px] glass-panel h-[100dvh] flex flex-col shrink-0 z-40 border-r border-black/5">
      {/* Header */}
      <div className="p-8 pb-4 flex items-center justify-between">
        <h1 className="text-3xl font-serif font-light tracking-wide flex items-center gap-2">
          AURA <span className="text-neutral-500 font-sans text-[10px] tracking-[0.4em] uppercase font-bold">Studio</span>
        </h1>
        <div className="flex items-center gap-2">
          {canInstall && (
            <Button 
              size="sm"
              variant="outline"
              onClick={install}
              className="h-8 rounded-full border-black/5 bg-black/5 hover:bg-black hover:text-white transition-all text-[9px] uppercase tracking-widest font-bold px-3 gap-1.5"
            >
              <DownloadIcon size={12} /> Instalar
            </Button>
          )}
          {user && isAdmin && (
            <Button 
              size="icon"
              variant="outline"
              onClick={props.onOpenAdmin}
              className="rounded-2xl border-black/5 hover:bg-black hover:text-white transition-all shadow-lg shadow-black/5"
            >
              <ShieldCheck size={18} />
            </Button>
          )}
          <Button 
            size="icon"
            variant="ghost"
            onClick={user ? signOut : () => setShowLoginModal(true)}
            className="rounded-2xl bg-black/5 hover:bg-black/10 border border-transparent hover:border-black/5"
          >
            {user ? <LogOut size={18} /> : <LogIn size={18} />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-8">
        <div className="py-6 space-y-10">
          <PromptSection 
            prompt={props.prompt}
            setPrompt={props.setPrompt}
            isEnhancing={props.isEnhancing}
            onEnhance={props.onEnhance}
            referenceImage={props.referenceImage}
            onClearReference={props.onClearReference}
          />

          <CharacterLibrary 
            currentPrompt={props.prompt}
            onSelect={(char) => {
              // Inyección de prompt: Prepend identity and set reference
              const newPrompt = `${char.base_prompt}, ${props.prompt}`;
              props.setPrompt(newPrompt);
              if (char.reference_image_url && props.setReferenceImage) {
                props.setReferenceImage(char.reference_image_url);
              }
            }}
          />

          <ArtisticControls 
            style={props.style}
            setStyle={props.setStyle}
            aspectRatio={props.aspectRatio}
            setAspectRatio={props.setAspectRatio}
            isHighRes={props.isHighRes}
            setIsHighRes={props.setIsHighRes}
            batchCount={props.batchCount}
            setBatchCount={props.setBatchCount}
          />

          <div className="space-y-4">
            <Button
              onClick={props.onGenerate}
              disabled={props.isGenerating || !props.prompt.trim()}
              className="w-full h-16 bg-black text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-xl shadow-black/10"
            >
              {props.isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Esculpiendo Obra...</span>
                </>
              ) : (
                <>
                  <span>Crear Retrato</span>
                  <Plus size={18} />
                </>
              )}
            </Button>

            {props.error && (
              <p className="text-red-500 text-[10px] text-center font-bold tracking-widest uppercase animate-bounce">
                {props.error}
              </p>
            )}
          </div>

          <Separator className="bg-black/5" />

          <div className="pb-10">
            <GalleryGrid 
              onSelectImage={props.onSelectImage} 
              onOpenGallery={props.onOpenGallery}
              onOpenLightbox={props.onOpenLightbox}
            />
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
