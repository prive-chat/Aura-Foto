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
