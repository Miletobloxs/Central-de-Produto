-- Migration 011: Grupo 3 — Discovery, Competitive Intel e Feature Flags
-- Execute no Supabase Dashboard → SQL Editor

-- ══════════════════════════════════════════════════════════════
-- 1. RESEARCHES — pesquisas do discovery
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS researches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'interview'
                CHECK (type IN ('interview', 'usability', 'survey', 'data')),
  status        TEXT NOT NULL DEFAULT 'planned'
                CHECK (status IN ('planned', 'ongoing', 'completed')),
  objective     TEXT,
  participants  INT DEFAULT 0,
  owner         TEXT,
  epic_id       TEXT REFERENCES epics(id) ON DELETE SET NULL,
  tags          TEXT[] DEFAULT '{}',
  research_date DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS researches_type_idx   ON researches(type);
CREATE INDEX IF NOT EXISTS researches_status_idx ON researches(status);
CREATE INDEX IF NOT EXISTS researches_epic_id_idx ON researches(epic_id);

ALTER TABLE researches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_researches" ON researches;
CREATE POLICY "auth_all_researches"
  ON researches FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS researches_updated_at ON researches;
CREATE TRIGGER researches_updated_at
  BEFORE UPDATE ON researches FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 2. INSIGHTS — insights extraídos de pesquisas
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS insights (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'behavior'
                CHECK (type IN ('pain', 'opportunity', 'behavior', 'request')),
  severity      TEXT NOT NULL DEFAULT 'medium'
                CHECK (severity IN ('high', 'medium', 'low')),
  research_id   UUID REFERENCES researches(id) ON DELETE SET NULL,
  epic_id       TEXT REFERENCES epics(id) ON DELETE SET NULL,
  tags          TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS insights_research_id_idx ON insights(research_id);
CREATE INDEX IF NOT EXISTS insights_epic_id_idx     ON insights(epic_id);
CREATE INDEX IF NOT EXISTS insights_type_idx        ON insights(type);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_insights" ON insights;
CREATE POLICY "auth_all_insights"
  ON insights FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- 3. COMPETITORS — concorrentes monitorados
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS competitors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  short_name      TEXT NOT NULL,
  color           TEXT DEFAULT 'bg-gray-100 text-gray-800',
  threat          TEXT NOT NULL DEFAULT 'médio'
                  CHECK (threat IN ('alto', 'médio', 'baixo')),
  differentiation TEXT,
  users           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_competitors" ON competitors;
CREATE POLICY "auth_all_competitors"
  ON competitors FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS competitors_updated_at ON competitors;
CREATE TRIGGER competitors_updated_at
  BEFORE UPDATE ON competitors FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 4. COMPETITIVE_FEATURES — matriz de features vs concorrentes
-- availability = JSONB { competitor_id: "available"|"in-dev"|"planned"|"unavailable" }
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS competitive_features (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature       TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'Plataforma',
  bloxs         TEXT NOT NULL DEFAULT 'unavailable'
                CHECK (bloxs IN ('available', 'in-dev', 'planned', 'unavailable')),
  availability  JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE competitive_features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_competitive_features" ON competitive_features;
CREATE POLICY "auth_all_competitive_features"
  ON competitive_features FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- 5. COMPETITIVE_MOVES — movimentos recentes dos concorrentes
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS competitive_moves (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id   UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  type            TEXT NOT NULL DEFAULT 'feature'
                  CHECK (type IN ('feature', 'product', 'pricing', 'growth', 'partnership')),
  description     TEXT NOT NULL,
  impact          TEXT NOT NULL DEFAULT 'médio'
                  CHECK (impact IN ('alto', 'médio', 'baixo')),
  move_date       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS competitive_moves_competitor_id_idx ON competitive_moves(competitor_id);

ALTER TABLE competitive_moves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_competitive_moves" ON competitive_moves;
CREATE POLICY "auth_all_competitive_moves"
  ON competitive_moves FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- 6. FEATURE_FLAGS — flags de controle de rollout
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS feature_flags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  description TEXT,
  type        TEXT NOT NULL DEFAULT 'release'
              CHECK (type IN ('release', 'experiment', 'kill-switch')),
  active      BOOLEAN NOT NULL DEFAULT true,
  rollout     INT NOT NULL DEFAULT 0 CHECK (rollout BETWEEN 0 AND 100),
  segments    TEXT[] DEFAULT '{}',
  modified_by TEXT,
  epic_id     TEXT REFERENCES epics(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_feature_flags" ON feature_flags;
CREATE POLICY "auth_all_feature_flags"
  ON feature_flags FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS feature_flags_updated_at ON feature_flags;
CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();
