import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Wand2, Loader2, Layers, Camera, Zap, Plus, LogOut, LogIn, Trash2 } from 'lucide-react';
import { ARTISTIC_STYLES, ASPECT_RATIOS, GeneratedImage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from '../../contexts/HistoryContext';

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
}

export function Sidebar({
  prompt, setPrompt, isGenerating, isEnhancing, error,
  batchCount, setBatchCount, isHighRes, setIsHighRes,
  aspectRatio, setAspectRatio, style, setStyle,
  onGenerate, onEnhance, onSelectImage
}: SidebarProps) {
  const { user, signOut, setShowLoginModal } = useAuth();
  const { history, clearHistory } = useHistory();

  return (
    <aside className="order-2 md:order-1 w-full md:w-[400px] glass-panel p-8 flex flex-col gap-10 md:overflow-y-auto shrink-0 z-40">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-serif font-light tracking-wide flex items-center gap-2">
          AURA <span className="text-neutral-500 font-sans text-sm tracking-[0.3em] uppercase">Studio</span>
        </h1>
        <button 
          onClick={user ? signOut : () => setShowLoginModal(true)}
          className="p-3 bg-black/5 hover:bg-black/10 rounded-2xl transition-all border border-black/5 group relative"
        >
          {user ? <LogOut size={16} className="text-neutral-500 group-hover:text-black" /> : <LogIn size={16} className="text-neutral-500 group-hover:text-black" />}
          {!user && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-900 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-black"></span>
            </span>
          )}
        </button>
      </div>

      <p className="text-label mb-2">Generador de Retratos Artísticos</p>

      <div className="space-y-8">
        <div className="space-y-4">
          <label className="text-label flex items-center gap-2">
            <Sparkles size={14} /> Descripción del Retrato
          </label>
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Mujer elegante en un vestido de seda, luz de atardecer..."
              className="w-full bg-black/5 border border-black/5 rounded-2xl p-5 pr-14 text-sm focus:outline-none focus:border-black/10 transition-all min-h-[140px] resize-none leading-relaxed placeholder:text-neutral-400 font-light text-black"
            />
            <button
              onClick={onEnhance}
              disabled={isEnhancing || !prompt.trim()}
              className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black text-neutral-400 hover:text-white rounded-xl transition-all border border-black/5 hover:border-black disabled:opacity-30"
              title="Mejorar con IA (Magic Prompt)"
            >
              {isEnhancing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            </button>
            <div className="absolute bottom-4 right-4 text-[10px] text-neutral-600 font-mono">
              {prompt.length} / 500
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-label flex items-center gap-2">
            <Layers size={14} /> Estilo Artístico
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ARTISTIC_STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-4 py-3 rounded-xl border text-[10px] uppercase tracking-wider transition-all duration-500 relative overflow-hidden group ${
                  style === s 
                  ? 'bg-black text-white border-black font-bold' 
                  : 'bg-black/5 border-black/5 text-neutral-500 hover:border-black/20'
                }`}
              >
                <span className="relative z-10">{s}</span>
                {style === s && (
                  <motion.div 
                    layoutId="activeStyle"
                    className="absolute inset-0 bg-black"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-label flex items-center gap-2">
            <Camera size={14} /> Relación de Aspecto
          </label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.value}
                onClick={() => setAspectRatio(r.value)}
                className={`px-4 py-2 rounded-full border text-[10px] uppercase tracking-widest transition-all duration-300 ${
                  aspectRatio === r.value 
                  ? 'bg-black text-white border-black' 
                  : 'bg-black/5 border-transparent text-neutral-500 hover:bg-black/10'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <label className="text-label flex items-center gap-2">
              <Zap size={14} /> Calidad
            </label>
            <button 
              onClick={() => setIsHighRes(!isHighRes)}
              className={`w-full py-3 rounded-xl border text-[10px] uppercase tracking-wider transition-all duration-300 ${isHighRes ? 'bg-black text-white border-black font-bold animate-pulse' : 'bg-black/5 border-black/5 text-neutral-500'}`}
            >
              {isHighRes ? 'Ultra 4K' : 'Estándar'}
            </button>
          </div>
          <div className="space-y-4">
            <label className="text-label flex items-center gap-2">
              <Plus size={14} /> Cantidad
            </label>
            <div className="flex gap-1 bg-black/5 p-1 rounded-xl border border-black/5">
              {[1, 2, 4].map(n => (
                <button 
                  key={n}
                  onClick={() => setBatchCount(n)}
                  className={`flex-1 py-1 rounded-lg text-[10px] transition-all ${batchCount === n ? 'bg-neutral-900 text-white font-bold shadow-sm' : 'text-neutral-500'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            {batchCount > 1 && (
              <p className="text-[9px] text-amber-600 font-medium tracking-tight animate-pulse">
                * Consume cuota {batchCount}x más rápido
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full h-16 bg-black text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] group overflow-hidden relative shadow-xl shadow-black/5"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Esculpiendo...</span>
            </>
          ) : (
            <>
              <span>Crear Retrato</span>
              <Plus size={18} />
            </>
          )}
        </button>

        {error && (
          <p className="text-red-500 text-[10px] text-center font-bold tracking-widest uppercase">{error}</p>
        )}
      </div>

      <div className="mt-auto pt-8 border-t border-black/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-label">Galería Reciente</h3>
          <button 
            onClick={clearHistory}
            className="text-[9px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
          >
            Borrar Todo
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 pb-8">
          {history.slice(0, 12).map((img, index) => (
            <motion.button
              key={img.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectImage(img)}
              className="aspect-square rounded-xl overflow-hidden border border-black/5 bg-black/[0.01] flex items-center justify-center relative group"
            >
              <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover transition-all duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" />
            </motion.button>
          ))}
        </div>
      </div>
    </aside>
  );
}
