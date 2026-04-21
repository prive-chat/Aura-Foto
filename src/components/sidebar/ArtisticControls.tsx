import React from 'react';
import { motion } from 'motion/react';
import { Layers, Camera, Zap, Plus } from 'lucide-react';
import { ARTISTIC_STYLES, ASPECT_RATIOS } from '../../types';

interface ArtisticControlsProps {
  style: string;
  setStyle: (v: string) => void;
  aspectRatio: any;
  setAspectRatio: (v: any) => void;
  isHighRes: boolean;
  setIsHighRes: (v: boolean) => void;
  batchCount: number;
  setBatchCount: (v: number) => void;
}

export function ArtisticControls({
  style, setStyle, aspectRatio, setAspectRatio,
  isHighRes, setIsHighRes, batchCount, setBatchCount
}: ArtisticControlsProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-2">
          <Layers size={14} /> Estilo Artístico
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ARTISTIC_STYLES.map((s) => (
            <button
              key={s.name}
              onClick={() => setStyle(s.name)}
              className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                style === s.name 
                ? 'border-white scale-[1.02] shadow-2xl shadow-white/10' 
                : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img 
                src={s.image} 
                alt={s.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-[9px] uppercase tracking-widest font-bold text-white mb-0.5">{s.name}</p>
                <p className="text-[7px] text-white/50 leading-tight line-clamp-1">{s.description}</p>
              </div>
              {style === s.name && (
                <motion.div 
                  layoutId="activeStyleBorder"
                  className="absolute inset-0 border-2 border-white rounded-2xl z-20 pointer-events-none"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-2">
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
          <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-2">
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
          <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-2">
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
    </div>
  );
}
