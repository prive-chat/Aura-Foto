import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Base64 to Blob conversion for Storage upload
 */
export async function uploadBase64Image(base64Data: string, userId: string): Promise<string> {
  try {
    const response = await fetch(base64Data);
    const blob = await response.blob();
    const fileName = `${userId}/${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, blob, { contentType: 'image/png' });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.warn("Storage upload failed, falling back to database storage:", error);
    return base64Data; // Fallback to storing raw data if bucket isn't setup
  }
}

export interface SavedImage {
  id: string;
  user_id: string;
  url: string;
  prompt: string;
  created_at: string;
}
