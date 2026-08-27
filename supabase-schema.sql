-- Supabase SQL Schema for the streaming application

-- 1. Create Media Table
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    year TEXT NOT NULL,
    duration TEXT,
    rating TEXT NOT NULL,
    quality TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('MOVIE', 'TV')),
    image_url TEXT NOT NULL,
    image_alt TEXT,
    banner_url TEXT,
    genre TEXT,
    genres TEXT[],
    country TEXT,
    language TEXT,
    network TEXT,
    description TEXT,
    cast_list TEXT[],
    seasons JSONB, -- Storing seasons as JSONB since it's nested
    completed_season_tag TEXT,
    video_url TEXT,
    player2_url TEXT,
    player3_url TEXT,
    player3_working BOOLEAN DEFAULT true,
    player4_url TEXT,
    subtitle_url TEXT,
    subtitle_vtt TEXT,
    download_link_480p TEXT,
    download_link_720p TEXT,
    download_link_1080p TEXT,
    download_telegram TEXT,
    download_direct TEXT,
    download_torrent TEXT,
    featured BOOLEAN DEFAULT false,
    trending BOOLEAN DEFAULT false,
    is_upcoming BOOLEAN DEFAULT false,
    has_sinhala_sub BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Published',
    slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    seo_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    schema_markup TEXT,
    trailer_url TEXT,
    subtitle_download_url TEXT
);

-- 2. Create Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    media_ids TEXT[] DEFAULT '{}',
    type TEXT DEFAULT 'REGULAR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    monetag_direct_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set RLS (Row Level Security) - Allow public read, restrict write
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all these tables
CREATE POLICY "Allow public read access on media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Allow public read access on collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Allow public read access on settings" ON public.settings FOR SELECT USING (true);

-- Allow authenticated users to mutate data (or allow all operations for now if authentication isn't set up yet)
-- Note: Replace with appropriate auth restrictions based on your exact Supabase role usage.
CREATE POLICY "Allow all operations for anon" ON public.media FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon" ON public.collections FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon" ON public.settings FOR ALL USING (true);

-- Initial System Settings Row
INSERT INTO public.settings (id, monetag_direct_link) VALUES ('system', '') ON CONFLICT DO NOTHING;
