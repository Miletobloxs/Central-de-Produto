-- Migration 013: Decisions — Mural de Decisões (ADRs)
-- Execute no Supabase Dashboard → SQL Editor

-- Drop garante idempotência: remove tabela anterior com schema diferente
DROP TABLE IF EXISTS decisions CASCADE;

CREATE TABLE decisions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adr_number    SERIAL NOT NULL,
  title         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('accepted', 'open', 'deprecated', 'superseded')),
  category      TEXT NOT NULL DEFAULT 'produto'
                CHECK (category IN ('produto', 'arquitetura', 'estrategia', 'processo')),
  decided_by    TEXT,
  participants  TEXT[] DEFAULT '{}',
  context       TEXT,
  decision      TEXT,
  rationale     TEXT,
  alternatives  JSONB DEFAULT '[]',
  consequences  TEXT,
  epic_link     TEXT,
  tags          TEXT[] DEFAULT '{}',
  decided_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX decisions_status_idx   ON decisions(status);
CREATE INDEX decisions_category_idx ON decisions(category);

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_decisions" ON decisions;
CREATE POLICY "auth_all_decisions"
  ON decisions FOR ALL TO authenticated USING (true) WITH CHECK (true);
