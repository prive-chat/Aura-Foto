/**
 * Core types for Aura Studio
 */

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  userId?: string;
  isFlagged?: boolean;
  isFeatured?: boolean;
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
  blur: number;
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

export interface ArtisticStyle {
  name: string;
  image: string;
  description: string;
}

export const ARTISTIC_STYLES: ArtisticStyle[] = [
  { 
    name: 'Glamour Cinematográfico', 
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Iluminación dramática y elegancia atemporal'
  },
  { 
    name: 'Noir Dramático', 
    image: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Sombras profundas y alto contraste en blanco y negro'
  },
  { 
    name: 'Luz Natural Suave', 
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Tonos pasteles y luz de tarde difuminada'
  },
  { 
    name: 'Editorial de Alta Moda', 
    image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Estética de revista de lujo y poses vanguardistas'
  },
  { 
    name: 'Cyberpunk Estilizado', 
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Luces de neón y atmósferas futuristas'
  },
  { 
    name: 'Vintage 35mm', 
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=200&h=200',
    description: 'Textura de grano analógico y colores cálidos'
  }
];

export interface Character {
  id: string;
  user_id: string;
  name: string;
  base_prompt: string;
  reference_image_url?: string;
  created_at: string;
}
