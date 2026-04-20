-- ==========================================================
-- AURA STUDIO: MASTER SQL SETUP (v2.4.1 - Edición Blindada)
-- ==========================================================

-- 1. EXTENSIONES Y LIMPIEZA INICIAL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. TABLAS NÚCLEO
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    is_super_admin BOOLEAN DEFAULT false,
    daily_usage_count INTEGER DEFAULT 0,
    max_daily_limit INTEGER DEFAULT 50,
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

-- 3. AUTOMATIZACIÓN DE PERFILES (Trigger)
-- Usa raw_user_meta_data (nombre exacto en Supabase Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sincronización Retroactiva inmediata
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. SEGURIDAD (RLS) - Blindada contra recursividad (Error 500)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Limpieza robusta de políticas anteriores (Evita el error "more than one row")
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' AND (tablename = 'profiles' OR tablename = 'images' OR tablename = 'characters')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON ' || quote_ident(policy_record.tablename);
    END LOOP;
END $$;

-- Políticas de Perfiles (Simples, sin llamadas a funciones para evitar bucles 500)
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas de Imágenes
CREATE POLICY "Images viewable by owner" ON public.images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Images insertable by owner" ON public.images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Images deletable by owner" ON public.images FOR DELETE USING (auth.uid() = user_id);

-- 5. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;

-- Limpieza de políticas de storage
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND (tablename = 'objects')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

CREATE POLICY "Storage Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Storage Owner Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Storage Owner Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 6. LÓGICA DE NEGOCIO (Incremento de Uso)
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

-- 7. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_images_user_id_created_at ON public.images(user_id, created_at DESC);

-- 8. PERSONAJES (Characters)
CREATE TABLE IF NOT EXISTS public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    base_prompt TEXT NOT NULL,
    reference_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Characters own access" ON public.characters FOR ALL TO authenticated USING (auth.uid() = user_id);
