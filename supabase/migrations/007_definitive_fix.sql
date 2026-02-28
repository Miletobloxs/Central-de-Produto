-- Migration 007: Correção definitiva do schema
-- Execute no Supabase Dashboard → SQL Editor
-- Seguro para rodar mesmo que migrações anteriores tenham sido executadas parcialmente

-- ══════════════════════════════════════════════════════════════
-- 1. FUNÇÃO updated_at (idempotente)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- 2. EPICS — corrige enum → TEXT e garante colunas necessárias
-- ══════════════════════════════════════════════════════════════

-- Converte status de ENUM (RoadmapStatus) para TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'epics' AND column_name = 'status'
      AND udt_name <> 'text' AND udt_name <> 'varchar'
  ) THEN
    ALTER TABLE epics ALTER COLUMN status TYPE TEXT USING status::TEXT;
  END IF;
END $$;

-- Converte priority de ENUM para TEXT (se for ENUM)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'epics' AND column_name = 'priority'
      AND udt_name <> 'text' AND udt_name <> 'varchar'
  ) THEN
    ALTER TABLE epics ALTER COLUMN priority TYPE TEXT USING priority::TEXT;
  END IF;
END $$;

-- Garante DEFAULT no id (para inserções sem Prisma)
ALTER TABLE epics ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;

-- Garante colunas novas (idempotente)
ALTER TABLE epics ADD COLUMN IF NOT EXISTS color  TEXT DEFAULT 'blue';
ALTER TABLE epics ADD COLUMN IF NOT EXISTS stream TEXT DEFAULT 'Plataforma Core';

-- RLS
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_epics" ON epics;
CREATE POLICY "auth_all_epics"
  ON epics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- 3. SPRINTS — DEFAULT no id, RLS e epic_id TEXT
-- ══════════════════════════════════════════════════════════════
ALTER TABLE sprints ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;

ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_sprints" ON sprints;
CREATE POLICY "auth_all_sprints"
  ON sprints FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Adiciona epic_id como TEXT (FK para epics.id que é TEXT/CUID)
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS epic_id TEXT REFERENCES epics(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS sprints_epic_id_idx ON sprints(epic_id);

-- ══════════════════════════════════════════════════════════════
-- 4. TASKS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'todo'
                 CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority       TEXT DEFAULT 'medium'
                 CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  story_points   INT DEFAULT 1,
  epic           TEXT,
  assignee       TEXT,
  sprint_id      TEXT REFERENCES sprints(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id)   ON DELETE CASCADE,
  position       INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_sprint_id_idx      ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS tasks_parent_task_id_idx ON tasks(parent_task_id);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_tasks" ON tasks;
CREATE POLICY "auth_all_tasks"
  ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 5. BACKLOG_ITEMS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS backlog_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  moscow_priority TEXT NOT NULL DEFAULT 'could'
                  CHECK (moscow_priority IN ('must', 'should', 'could', 'wont')),
  story_points    INT DEFAULT 1,
  business_value  INT DEFAULT 3 CHECK (business_value BETWEEN 1 AND 5),
  epic            TEXT,
  status          TEXT DEFAULT 'open'
                  CHECK (status IN ('open', 'in_progress', 'done', 'rejected')),
  assignee        TEXT,
  sprint_id       TEXT REFERENCES sprints(id) ON DELETE SET NULL,
  position        INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE backlog_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_backlog" ON backlog_items;
CREATE POLICY "auth_all_backlog"
  ON backlog_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS backlog_items_updated_at ON backlog_items;
CREATE TRIGGER backlog_items_updated_at
  BEFORE UPDATE ON backlog_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 6. OBJECTIVES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS objectives (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  quarter     TEXT NOT NULL,
  status      TEXT DEFAULT 'on_track'
              CHECK (status IN ('on_track', 'at_risk', 'off_track', 'completed')),
  owner       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_objectives" ON objectives;
CREATE POLICY "auth_all_objectives"
  ON objectives FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS objectives_updated_at ON objectives;
CREATE TRIGGER objectives_updated_at
  BEFORE UPDATE ON objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 7. KEY_RESULTS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS key_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  objective_id     UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  target_value     DECIMAL DEFAULT 100,
  current_value    DECIMAL DEFAULT 0,
  unit             TEXT DEFAULT '%',
  status           TEXT DEFAULT 'on_track'
                   CHECK (status IN ('on_track', 'at_risk', 'off_track', 'completed')),
  dashboard_metric TEXT,
  owner            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_key_results" ON key_results;
CREATE POLICY "auth_all_key_results"
  ON key_results FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS key_results_updated_at ON key_results;
CREATE TRIGGER key_results_updated_at
  BEFORE UPDATE ON key_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 8. CHECKINS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS checkins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  value         DECIMAL NOT NULL,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_checkins" ON checkins;
CREATE POLICY "auth_all_checkins"
  ON checkins FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- 9. SPRINT_REVIEWS (caso migration 004 não tenha sido executada)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sprint_reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id  TEXT NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  theme      TEXT,
  blockers   TEXT[]  DEFAULT '{}',
  learnings  TEXT[]  DEFAULT '{}',
  highlights JSONB   DEFAULT '[]',
  next_theme TEXT,
  next_items TEXT[]  DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (sprint_id)
);

ALTER TABLE sprint_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_sprint_reviews" ON sprint_reviews;
CREATE POLICY "auth_all_sprint_reviews"
  ON sprint_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS sprint_reviews_updated_at ON sprint_reviews;
CREATE TRIGGER sprint_reviews_updated_at
  BEFORE UPDATE ON sprint_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
