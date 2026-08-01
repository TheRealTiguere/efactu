-- =========================================================================
-- SQL SETUP SCRIPT FOR SUPABASE - eFactu Comparateur
-- Execute this script in the Supabase SQL Editor to initialize your database.
-- =========================================================================

-- 1. Create 'platforms' table
CREATE TABLE IF NOT EXISTS public.platforms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    "priceLabel" TEXT NOT NULL,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 3.0,
    description TEXT NOT NULL,
    advantages JSONB NOT NULL DEFAULT '[]'::jsonb,
    disadvantages JSONB NOT NULL DEFAULT '[]'::jsonb,
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    compatibility JSONB NOT NULL DEFAULT '{}'::jsonb,
    url TEXT NOT NULL,
    recommended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create 'questions' table
CREATE TABLE IF NOT EXISTS public.questions (
    step INTEGER PRIMARY KEY,
    id TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    type TEXT NOT NULL,
    required BOOLEAN NOT NULL DEFAULT true,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create 'leads' table (Captured questionnaire submissions)
CREATE TABLE IF NOT EXISTS public.leads (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    lead_name TEXT NOT NULL,
    lead_company TEXT NOT NULL,
    lead_email TEXT NOT NULL,
    lead_phone TEXT,
    status TEXT,
    volume TEXT,
    software TEXT,
    budget TEXT,
    assistance TEXT,
    raw_answers JSONB
);

-- 4. Create 'contacts' table (Captured contact support requests)
CREATE TABLE IF NOT EXISTS public.contacts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL
);

-- =========================================================================
-- SECURITY POLICIES (Row Level Security - RLS)
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- ----------------- Policies for PLATFORMS -----------------
-- Allow public select (READ) for questionnaire scoring and matrix rendering
CREATE POLICY "Allow public read platforms" ON public.platforms
    FOR SELECT USING (true);

-- Allow public write (insert/update/delete) using the anon key for testing administration.
-- WARNING: In a highly secure production system, you should restrict writes to authenticated administrators only.
CREATE POLICY "Allow anon write platforms" ON public.platforms
    FOR ALL USING (true) WITH CHECK (true);

-- ----------------- Policies for QUESTIONS -----------------
-- Allow public select (READ)
CREATE POLICY "Allow public read questions" ON public.questions
    FOR SELECT USING (true);

-- Allow public write (ALL) using the anon key
CREATE POLICY "Allow anon write questions" ON public.questions
    FOR ALL USING (true) WITH CHECK (true);

-- ----------------- Policies for LEADS -----------------
-- Allow public inserts (WRITE) so visitors can submit questionnaire leads
CREATE POLICY "Allow public insert leads" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Allow public select/delete (For Admin Panel via anon key)
CREATE POLICY "Allow anon admin leads" ON public.leads
    FOR ALL USING (true) WITH CHECK (true);

-- ----------------- Policies for CONTACTS -----------------
-- Allow public inserts (WRITE) so visitors can submit contact messages
CREATE POLICY "Allow public insert contacts" ON public.contacts
    FOR INSERT WITH CHECK (true);

-- Allow public select/delete (For Admin Panel via anon key)
CREATE POLICY "Allow anon admin contacts" ON public.contacts
    FOR ALL USING (true) WITH CHECK (true);
