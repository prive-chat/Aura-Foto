-- ==========================================================
-- AURA STUDIO: MASTER SQL SETUP (v2.2 - Resiliente)
-- ==========================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLAS NÚCLEO
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MIGRACIONES (Asegura columnas nuevas si la tabla ya existía)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_usage_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_daily_limit INTEGER DEFAULT 50;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_usage_reset TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.images ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 4. ÍNDICES DE RENDIMIENTO (Ahora seguros porque las columnas existen)
CREATE INDEX IF NOT EXISTS idx_images_user_id_created_at ON public.images(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_is_featured ON public.images(is_featured) WHERE is_featured = true;

-- 5. SEGURIDAD (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Perfiles: Ver propio, Superadmin ve todo
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true);
$$ LANGUAGE sql SECURITY DEFINER;

-- Limpieza de políticas antiguas para evitar conflictos al re-ejecutar
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Own Profile Select" ON public.profiles;
    DROP POLICY IF EXISTS "Admin Profile Select" ON public.profiles;
    DROP POLICY IF EXISTS "Image Select" ON public.images;
    DROP POLICY IF EXISTS "Image Insert" ON public.images;
    DROP POLICY IF EXISTS "Image Delete" ON public.images;
    DROP POLICY IF EXISTS "Image Update Admin" ON public.images;
END $$;

CREATE POLICY "Own Profile Select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin Profile Select" ON public.profiles FOR SELECT TO authenticated USING (is_admin());

-- Imágenes: Ver propias, Insertar propias, Borrar propias
CREATE POLICY "Image Select" ON public.images FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Image Insert" ON public.images FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Image Delete" ON public.images FOR DELETE TO authenticated USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Image Update Admin" ON public.images FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 6. STORAGE (Bucket & Políticas)
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Storage Object Select Public" ON storage.objects;
    DROP POLICY IF EXISTS "Storage Object Insert Owner" ON storage.objects;
    DROP POLICY IF EXISTS "Storage Object Delete Owner" ON storage.objects;
END $$;

CREATE POLICY "Storage Object Select Public" ON storage.objects FOR SELECT TO public USING (bucket_id = 'images');
CREATE POLICY "Storage Object Insert Owner" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Storage Object Delete Owner" ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 7. LÓGICA DE NEGOCIO (Reset de Uso y Contadores)
CREATE OR REPLACE FUNCTION public.increment_usage(user_id UUID, inc INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET 
        daily_usage_count = CASE 
            WHEN date_trunc('day', last_usage_reset) < date_trunc('day', now()) THEN inc
            ELSE daily_usage_count + inc
        END,
        last_usage_reset = CASE 
            WHEN date_trunc('day', last_usage_reset) < date_trunc('day', now()) THEN now()
            ELSE last_usage_reset
        END
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. BIBLIOTECA DE PERSONAJES
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    base_prompt TEXT NOT NULL,
    reference_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Character Full Access Owner" ON public.characters;
CREATE POLICY "Character Full Access Owner" ON public.characters FOR ALL TO authenticated USING (auth.uid() = user_id);
