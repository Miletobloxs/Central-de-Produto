-- Migration 009: Tabelas de Feedback e NPS
-- Execute no Supabase Dashboard → SQL Editor

-- ══════════════════════════════════════════════════════════════
-- 1. NPS_MONTHLY — registro mensal de NPS pela equipe de produto
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS nps_monthly (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month           TEXT NOT NULL UNIQUE,      -- "2026-01" (YYYY-MM)
  score           DECIMAL(4,2) NOT NULL      -- score médio 0–10
                  CHECK (score >= 0 AND score <= 10),
  total_responses INT NOT NULL DEFAULT 0,
  promoters       INT NOT NULL DEFAULT 0,    -- score 9–10
  neutrals        INT NOT NULL DEFAULT 0,    -- score 7–8
  detractors      INT NOT NULL DEFAULT 0,    -- score 0–6
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE nps_monthly ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_nps_monthly" ON nps_monthly;
CREATE POLICY "auth_all_nps_monthly"
  ON nps_monthly FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- 2. FEEDBACK_ENTRIES — feedbacks individuais dos usuários
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS feedback_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote         TEXT NOT NULL,
  sentiment     TEXT NOT NULL DEFAULT 'neutral'
                CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  category      TEXT NOT NULL DEFAULT 'Geral',
  source        TEXT DEFAULT 'Web'
                CHECK (source IN ('App Mobile', 'Web', 'Email', 'Entrevista', 'Survey')),
  score         INT CHECK (score BETWEEN 1 AND 10),
  epic_id       TEXT REFERENCES epics(id) ON DELETE SET NULL,
  sprint_id     TEXT REFERENCES sprints(id) ON DELETE SET NULL,
  feedback_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feedback_entries_epic_id_idx     ON feedback_entries(epic_id);
CREATE INDEX IF NOT EXISTS feedback_entries_sentiment_idx   ON feedback_entries(sentiment);
CREATE INDEX IF NOT EXISTS feedback_entries_category_idx    ON feedback_entries(category);
CREATE INDEX IF NOT EXISTS feedback_entries_date_idx        ON feedback_entries(feedback_date DESC);

ALTER TABLE feedback_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_feedback_entries" ON feedback_entries;
CREATE POLICY "auth_all_feedback_entries"
  ON feedback_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
