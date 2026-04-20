-- ==========================================================
-- AURA STUDIO: MASTER SQL SETUP
-- Ejecuta este script en el editor SQL de Supabase
-- ==========================================================

-- 1. CREACIÓN DE TABLAS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    is_super_admin BOOLEAN DEFAULT false,
    daily_usage_count INTEGER DEFAULT 0,
    max_daily_limit INTEGER DEFAULT 20,
    last_usage_reset TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    is_flagged BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ACTIVAR RLS (Row Level Security) EN LAS TABLAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE SEGURIDAD

-- Profiles: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view their own profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Superadmin puede ver TODOS los perfiles
-- Usar una función para evitar recursión RLS
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_super_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Superadmin view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (is_admin());

-- Images: Usuarios solo pueden ver sus propias imágenes
CREATE POLICY "Users can view their own images"
ON public.images FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_admin());

-- Usuarios solo pueden insertar sus propias imágenes
CREATE POLICY "Users can insert their own images"
ON public.images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuarios solo pueden borrar sus propias imágenes
CREATE POLICY "Users can delete their own images"
ON public.images FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR is_admin());

-- Superadmin puede actualizar imágenes (flag/feature)
CREATE POLICY "Superadmin can update images"
ON public.images FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

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

-- 6. FUNCIONES Y TRIGGERS DE UTILIDAD
-- Incrementar el contador de uso diario
CREATE OR REPLACE FUNCTION public.increment_usage(user_id UUID, inc INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET daily_usage_count = daily_usage_count + inc
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. BIBLIOTECA DE PERSONAJES
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    base_prompt TEXT NOT NULL,
    reference_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own characters"
ON public.characters FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
