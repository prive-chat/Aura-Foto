-- ==========================================================
-- AURA STUDIO: MASTER SQL SETUP
-- Ejecuta este script en el editor SQL de Supabase
-- ==========================================================

-- 1. CREACIÓN DE LA TABLA DE IMÁGENES
CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ACTIVAR RLS (Row Level Security) EN LA TABLA
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE SEGURIDAD PARA LA TABLA (Database)
-- Usuarios solo pueden ver sus propias imágenes
CREATE POLICY "Users can view their own images"
ON public.images FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuarios solo pueden insertar sus propias imágenes
CREATE POLICY "Users can insert their own images"
ON public.images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuarios solo pueden borrar sus propias imágenes
CREATE POLICY "Users can delete their own images"
ON public.images FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. CONFIGURACIÓN DE STORAGE (Buckets)
-- Insertar el bucket 'images' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. POLÍTICAS DE SEGURIDAD PARA STORAGE (Bucket policies)
-- Permitir que los usuarios vean objetos (si el bucket es público, esto es opcional pero refuerza)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Permitir a los usuarios subir imágenes a su propia carpeta (userId/)
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a los usuarios borrar sus propias imágenes en su carpeta
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Comentario informativo
COMMENT ON TABLE public.images IS 'Almacena referencias a las obras generadas por los usuarios de Aura.';
