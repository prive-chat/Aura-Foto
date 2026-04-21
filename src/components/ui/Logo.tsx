import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'white' | 'minimal';
  showText?: boolean;
}

/**
 * Official Aura Studio Logo Component
 * A minimalist, ethereal representation of creativity and light.
 */
export const Logo = ({ 
  className = '', 
  size = 40, 
  variant = 'white', // Default to white for dark theme
  showText = false 
}: LogoProps) => {
  const isWhite = variant === 'white';
  
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <motion.div 
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* The Aura Glow - Atmospheric Bloom */}
        <motion.div 
          className={`absolute inset-0 rounded-full blur-2xl opacity-30 ${isWhite ? 'bg-white/40' : 'bg-black/10'}`}
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.3, 0.1] 
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* The SVG Logo Mark */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-2xl"
        >
          {/* Main Geometric Frame */}
          <path
            d="M50 15L85 85H15L50 15Z"
            stroke={isWhite ? 'white' : 'black'}
            strokeWidth="3"
            strokeLinejoin="round"
            className="opacity-10"
          />
          
          {/* Internal 'A' / Peak - Sharp Artistic lines */}
          <path
            d="M50 20L75 80"
            stroke={isWhite ? 'white' : 'black'}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M50 20L25 80"
            stroke={isWhite ? 'white' : 'black'}
            strokeWidth="8"
            strokeLinecap="round"
            className="opacity-30"
          />
          
          {/* The Aura Beam - Horizontal balance */}
          <motion.path
            d="M32 65H68"
            stroke={isWhite ? 'white' : 'black'}
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "circOut" }}
          />

          {/* Core Light Point - Ethereal source */}
          <circle 
            cx="50" 
            cy="40" 
            r="4" 
            fill={isWhite ? 'white' : 'black'} 
            className="animate-pulse shadow-sm"
          />
        </svg>
      </motion.div>

      {showText && (
        <div className={`flex flex-col select-none ${isWhite ? 'text-white' : 'text-neutral-900'}`}>
          <span className="text-xl font-serif font-light tracking-[0.3em] uppercase leading-none italic text-white/90">
            Aura
          </span>
          <span className="text-[7px] font-sans font-bold tracking-[0.5em] uppercase text-white/30 mt-1.5">
            Studio Creative
          </span>
        </div>
      )}
    </div>
  );
};
