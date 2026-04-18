/**
 * Core types for Aura Studio
 */

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  userId?: string;
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
}

export interface AspectRatio {
  label: string;
  value: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}

export const ASPECT_RATIOS: AspectRatio[] = [
  { label: 'Retrato (3:4)', value: '3:4' },
  { label: 'Vertical (9:16)', value: '9:16' },
  { label: 'Cuadrado (1:1)', value: '1:1' },
  { label: 'Horizontal (16:9)', value: '16:9' },
];

export const ARTISTIC_STYLES = [
  'Glamour Cinematográfico',
  'Noir Dramático',
  'Luz Natural Suave',
  'Editorial de Alta Moda',
  'Cyberpunk Estilizado',
  'Vintage 35mm'
];
