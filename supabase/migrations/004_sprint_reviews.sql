-- Migration 004: Sprint Reviews
-- Execute no Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS sprint_reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id  TEXT NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  theme      TEXT,
  blockers   TEXT[] DEFAULT '{}',
  learnings  TEXT[] DEFAULT '{}',
  highlights JSONB NOT NULL DEFAULT '[]',
  next_theme TEXT,
  next_items TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sprint_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_sprint_reviews" ON sprint_reviews;
CREATE POLICY "auth_all_sprint_reviews" ON sprint_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE TRIGGER sprint_reviews_updated_at
  BEFORE UPDATE ON sprint_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
