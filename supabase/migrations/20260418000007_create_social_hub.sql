-- ============================================================
-- Migration: 20260418000007_create_social_hub
-- Purpose: Create contacts, events, and debts for the Social Hub / CRM
-- ============================================================

-- Contacts table (Personal CRM)
CREATE TABLE IF NOT EXISTS public.contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  photo_url     TEXT,
  groups        TEXT[] DEFAULT '{}',  -- custom groups: "Close Circle", "Colleagues"
  birthday      DATE,
  city          TEXT,
  social_links  JSONB DEFAULT '{}'::jsonb,  -- {instagram, whatsapp, telegram, phone, email}
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON public.contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts"
  ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts"
  ON public.contacts FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts"
  ON public.contacts FOR DELETE USING (auth.uid() = user_id);

-- Events table (Social Hub events, birthdays, meetups)
CREATE TABLE IF NOT EXISTS public.events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id    UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  event_date    TIMESTAMPTZ NOT NULL,
  description   TEXT,
  is_recurring  BOOLEAN DEFAULT false NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(user_id, event_date);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events"
  ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own events"
  ON public.events FOR DELETE USING (auth.uid() = user_id);

-- Debts table (mutual debt tracking)
CREATE TABLE IF NOT EXISTS public.debts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id    UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  direction     debt_direction NOT NULL,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency      TEXT DEFAULT 'USD' NOT NULL,
  description   TEXT,
  is_settled    BOOLEAN DEFAULT false NOT NULL,
  settled_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_contact_id ON public.debts(contact_id);

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own debts"
  ON public.debts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own debts"
  ON public.debts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own debts"
  ON public.debts FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own debts"
  ON public.debts FOR DELETE USING (auth.uid() = user_id);
