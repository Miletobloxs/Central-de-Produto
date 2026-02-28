-- Migration 005: Cria tabelas faltantes e corrige sprints
-- Execute no Supabase Dashboard → SQL Editor

-- ── 1. Corrige a tabela sprints (schema Prisma) ───────────────
-- Adiciona DEFAULT para id (Prisma gerava o CUID no app)
ALTER TABLE sprints
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;

-- Habilita RLS e abre acesso a usuários autenticados
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_sprints" ON sprints;
CREATE POLICY "auth_all_sprints"
  ON sprints FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 2. Tabela tasks ───────────────────────────────────────────
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

CREATE OR REPLACE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. Tabela backlog_items ───────────────────────────────────
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

CREATE OR REPLACE TRIGGER backlog_items_updated_at
  BEFORE UPDATE ON backlog_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. Tabela objectives ──────────────────────────────────────
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

CREATE OR REPLACE TRIGGER objectives_updated_at
  BEFORE UPDATE ON objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 5. Tabela key_results ─────────────────────────────────────
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

CREATE OR REPLACE TRIGGER key_results_updated_at
  BEFORE UPDATE ON key_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 6. Tabela checkins ────────────────────────────────────────
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
