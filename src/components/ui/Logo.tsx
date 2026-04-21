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
  variant = 'default', 
  showText = false 
}: LogoProps) => {
  const isWhite = variant === 'white';
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div 
        className="relative flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* The Aura Glow */}
        <motion.div 
          className={`absolute inset-0 rounded-full blur-xl opacity-20 ${isWhite ? 'bg-white' : 'bg-black'}`}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* The SVG Logo Mark */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full"
        >
          {/* Main Geometric Frame */}
          <path
            d="M50 15L85 85H15L50 15Z"
            stroke={isWhite ? 'white' : 'black'}
            strokeWidth="4"
            strokeLinejoin="round"
            className="opacity-10"
          />
          
          {/* Internal 'A' / Peak */}
          <path
            d="M50 25L75 80"
            stroke={isWhite ? 'white' : 'black'}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M50 25L25 80"
            stroke={isWhite ? 'white' : 'black'}
            strokeWidth="8"
            strokeLinecap="round"
            className="opacity-40"
          />
          
          {/* The Aura Beam */}
          <motion.path
            d="M35 60H65"
            stroke={isWhite ? 'white' : 'black'}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Core Light Point */}
          <circle 
            cx="50" 
            cy="45" 
            r="4" 
            fill={isWhite ? 'white' : 'black'} 
            className="animate-pulse"
          />
        </svg>
      </motion.div>

      {showText && (
        <div className={`flex flex-col select-none ${isWhite ? 'text-white' : 'text-neutral-900'}`}>
          <span className="text-xl font-serif font-light tracking-[0.2em] uppercase leading-none italic">
            Aura
          </span>
          <span className="text-[8px] font-sans font-bold tracking-[0.4em] uppercase opacity-50 mt-1">
            Studio Creative
          </span>
        </div>
      )}
    </div>
  );
};
