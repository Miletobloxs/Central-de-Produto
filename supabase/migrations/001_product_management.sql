-- ============================================================
-- Central de Produto — Bloxs
-- Migration 001: Product Management Tables
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- Sprints
CREATE TABLE IF NOT EXISTS sprints (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  goal        TEXT,
  status      TEXT NOT NULL DEFAULT 'planning'
              CHECK (status IN ('planning', 'active', 'completed')),
  start_date  DATE,
  end_date    DATE,
  velocity    INT DEFAULT 0,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks (vinculadas a um sprint)
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'todo'
               CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority     TEXT DEFAULT 'medium'
               CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  story_points INT DEFAULT 1,
  epic         TEXT,
  assignee     TEXT,
  sprint_id    UUID REFERENCES sprints(id) ON DELETE SET NULL,
  position     INT DEFAULT 0,
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Backlog Items (MoSCoW)
CREATE TABLE IF NOT EXISTS backlog_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  moscow_priority  TEXT NOT NULL DEFAULT 'could'
                   CHECK (moscow_priority IN ('must', 'should', 'could', 'wont')),
  story_points     INT DEFAULT 1,
  business_value   INT DEFAULT 3 CHECK (business_value BETWEEN 1 AND 5),
  epic             TEXT,
  status           TEXT DEFAULT 'open'
                   CHECK (status IN ('open', 'in_progress', 'done', 'rejected')),
  assignee         TEXT,
  sprint_id        UUID REFERENCES sprints(id) ON DELETE SET NULL,
  position         INT DEFAULT 0,
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Objectives (OKRs)
CREATE TABLE IF NOT EXISTS objectives (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  quarter     TEXT NOT NULL,
  status      TEXT DEFAULT 'on_track'
              CHECK (status IN ('on_track', 'at_risk', 'off_track', 'completed')),
  owner       TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Key Results
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
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins (histórico de atualizações de KRs)
CREATE TABLE IF NOT EXISTS checkins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id  UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  value          DECIMAL NOT NULL,
  note           TEXT,
  created_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== ROW LEVEL SECURITY =====================
ALTER TABLE sprints       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives    ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results   ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins      ENABLE ROW LEVEL SECURITY;

-- Todos os usuários autenticados têm acesso total
DROP POLICY IF EXISTS "auth_all_sprints"     ON sprints;
DROP POLICY IF EXISTS "auth_all_tasks"       ON tasks;
DROP POLICY IF EXISTS "auth_all_backlog"     ON backlog_items;
DROP POLICY IF EXISTS "auth_all_objectives"  ON objectives;
DROP POLICY IF EXISTS "auth_all_key_results" ON key_results;
DROP POLICY IF EXISTS "auth_all_checkins"    ON checkins;

CREATE POLICY "auth_all_sprints"       ON sprints       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_tasks"         ON tasks         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_backlog"       ON backlog_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_objectives"    ON objectives    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_key_results"   ON key_results   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_checkins"      ON checkins      FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===================== UPDATED_AT TRIGGER =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER sprints_updated_at
  BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER backlog_items_updated_at
  BEFORE UPDATE ON backlog_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER objectives_updated_at
  BEFORE UPDATE ON objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER key_results_updated_at
  BEFORE UPDATE ON key_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();
