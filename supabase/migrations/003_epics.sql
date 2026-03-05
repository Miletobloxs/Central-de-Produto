-- Migration 003: Épicos para Roadmap
-- Execute no Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS epics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  stream      TEXT NOT NULL DEFAULT 'Plataforma Core',
  status      TEXT NOT NULL DEFAULT 'planned'
              CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed')),
  priority    TEXT NOT NULL DEFAULT 'medium'
              CHECK (priority IN ('low', 'medium', 'high')),
  color       TEXT NOT NULL DEFAULT 'blue',
  start_date  DATE,
  end_date    DATE,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Uma sprint pertence a no máximo um épico
ALTER TABLE sprints
  ADD COLUMN IF NOT EXISTS epic_id UUID REFERENCES epics(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS sprints_epic_id_idx ON sprints(epic_id);

-- RLS
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_epics" ON epics;
CREATE POLICY "auth_all_epics" ON epics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- updated_at trigger (função já criada em 001)
CREATE OR REPLACE TRIGGER epics_updated_at
  BEFORE UPDATE ON epics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
