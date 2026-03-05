-- ════════════════════════════════════════════════════════════════════
-- Migration 015: MASTER RESET — recria todas as tabelas do zero
-- Execute no Supabase Dashboard → SQL Editor
-- ATENÇÃO: dropa e recria tudo. Use apenas em banco vazio ou dev.
-- ════════════════════════════════════════════════════════════════════

-- ── Drop tudo em ordem inversa de dependência ─────────────────────
DROP TABLE IF EXISTS changelog_items     CASCADE;
DROP TABLE IF EXISTS releases            CASCADE;
DROP TABLE IF EXISTS decisions           CASCADE;
DROP TABLE IF EXISTS competitive_moves   CASCADE;
DROP TABLE IF EXISTS competitive_features CASCADE;
DROP TABLE IF EXISTS competitors         CASCADE;
DROP TABLE IF EXISTS insights            CASCADE;
DROP TABLE IF EXISTS researches          CASCADE;
DROP TABLE IF EXISTS feature_flags       CASCADE;
DROP TABLE IF EXISTS incidents           CASCADE;
DROP TABLE IF EXISTS bugs                CASCADE;
DROP TABLE IF EXISTS service_checks      CASCADE;
DROP TABLE IF EXISTS feedback_entries    CASCADE;
DROP TABLE IF EXISTS nps_monthly         CASCADE;
DROP TABLE IF EXISTS sprint_reviews      CASCADE;
DROP TABLE IF EXISTS checkins            CASCADE;
DROP TABLE IF EXISTS key_results         CASCADE;
DROP TABLE IF EXISTS objectives          CASCADE;
DROP TABLE IF EXISTS backlog_items       CASCADE;
DROP TABLE IF EXISTS tasks               CASCADE;
DROP TABLE IF EXISTS sprints             CASCADE;
DROP TABLE IF EXISTS epics               CASCADE;

-- ── Função updated_at ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════════════════
-- 1. EPICS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE epics (
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
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_epics" ON epics FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER epics_updated_at BEFORE UPDATE ON epics FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- 2. SPRINTS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE sprints (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  goal        TEXT,
  status      TEXT NOT NULL DEFAULT 'planning'
              CHECK (status IN ('planning', 'active', 'completed')),
  start_date  DATE,
  end_date    DATE,
  velocity    INT DEFAULT 0,
  epic_id     UUID REFERENCES epics(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX sprints_epic_id_idx ON sprints(epic_id);
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_sprints" ON sprints FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER sprints_updated_at BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- 3. TASKS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'todo'
                 CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority       TEXT NOT NULL DEFAULT 'medium'
                 CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  story_points   INT DEFAULT 1,
  epic           TEXT,
  assignee       TEXT,
  sprint_id      UUID REFERENCES sprints(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id)   ON DELETE CASCADE,
  position       INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX tasks_sprint_id_idx      ON tasks(sprint_id);
CREATE INDEX tasks_parent_task_id_idx ON tasks(parent_task_id);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_tasks" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- 4. BACKLOG ITEMS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE backlog_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  moscow_priority  TEXT NOT NULL DEFAULT 'could'
                   CHECK (moscow_priority IN ('must', 'should', 'could', 'wont')),
  story_points     INT DEFAULT 1,
  business_value   INT DEFAULT 3 CHECK (business_value BETWEEN 1 AND 5),
  epic             TEXT,
  status           TEXT DEFAULT 'open'
                   CHECK (status IN ('open', 'in_sprint', 'in_progress', 'done', 'rejected')),
  assignee         TEXT,
  sprint_id        UUID REFERENCES sprints(id) ON DELETE SET NULL,
  position         INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE backlog_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_backlog" ON backlog_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER backlog_items_updated_at BEFORE UPDATE ON backlog_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════���════
-- 5. OBJECTIVES & KEY RESULTS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE objectives (
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
CREATE POLICY "auth_all_objectives" ON objectives FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER objectives_updated_at BEFORE UPDATE ON objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE key_results (
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
CREATE POLICY "auth_all_key_results" ON key_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER key_results_updated_at BEFORE UPDATE ON key_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE checkins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  value         DECIMAL NOT NULL,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_checkins" ON checkins FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════
-- 6. SPRINT REVIEWS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE sprint_reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id  UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  theme      TEXT,
  blockers   TEXT[] DEFAULT '{}',
  learnings  TEXT[] DEFAULT '{}',
  highlights JSONB NOT NULL DEFAULT '[]',
  next_theme TEXT,
  next_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sprint_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_sprint_reviews" ON sprint_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER sprint_reviews_updated_at BEFORE UPDATE ON sprint_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- 7. FEEDBACK & NPS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE nps_monthly (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month           TEXT NOT NULL UNIQUE,
  score           DECIMAL(4,2) NOT NULL CHECK (score >= 0 AND score <= 10),
  total_responses INT NOT NULL DEFAULT 0,
  promoters       INT NOT NULL DEFAULT 0,
  neutrals        INT NOT NULL DEFAULT 0,
  detractors      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE nps_monthly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_nps_monthly" ON nps_monthly FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE feedback_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote         TEXT NOT NULL,
  sentiment     TEXT NOT NULL DEFAULT 'neutral'
                CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  category      TEXT NOT NULL DEFAULT 'Geral',
  source        TEXT DEFAULT 'Web'
                CHECK (source IN ('App Mobile', 'Web', 'Email', 'Entrevista', 'Survey')),
  score         INT CHECK (score BETWEEN 1 AND 10),
  epic_id       UUID REFERENCES epics(id) ON DELETE SET NULL,
  sprint_id     UUID REFERENCES sprints(id) ON DELETE SET NULL,
  feedback_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX feedback_entries_epic_id_idx   ON feedback_entries(epic_id);
CREATE INDEX feedback_entries_sentiment_idx ON feedback_entries(sentiment);
CREATE INDEX feedback_entries_date_idx      ON feedback_entries(feedback_date DESC);
ALTER TABLE feedback_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_feedback_entries" ON feedback_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════
-- 8. HEALTH: SERVICE_CHECKS, BUGS, INCIDENTS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE service_checks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL DEFAULT 'operational'
               CHECK (status IN ('operational', 'degraded', 'outage')),
  latency_ms   INT DEFAULT 0,
  uptime_pct   DECIMAL(5,2) DEFAULT 100.00,
  icon         TEXT DEFAULT 'Globe',
  notes        TEXT,
  checked_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE service_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_service_checks" ON service_checks FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE bugs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  severity    TEXT NOT NULL DEFAULT 'medium'
              CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'in_progress', 'resolved')),
  sprint_id   UUID REFERENCES sprints(id) ON DELETE SET NULL,
  epic_id     UUID REFERENCES epics(id)   ON DELETE SET NULL,
  assignee    TEXT,
  reported_at DATE NOT NULL DEFAULT CURRENT_DATE,
  resolved_at DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_bugs" ON bugs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER bugs_updated_at BEFORE UPDATE ON bugs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE incidents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  severity       TEXT NOT NULL DEFAULT 'medium'
                 CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'investigating', 'resolved', 'postmortem')),
  affected_users INT DEFAULT 0,
  affected_pct   DECIMAL(5,2) DEFAULT 0,
  components     TEXT[] DEFAULT '{}',
  root_cause     TEXT,
  sprint_task_id TEXT,
  timeline       JSONB DEFAULT '[]',
  started_at     TIMESTAMPTZ DEFAULT NOW(),
  resolved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX incidents_status_idx   ON incidents(status);
CREATE INDEX incidents_severity_idx ON incidents(severity);
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_incidents" ON incidents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- 9. DISCOVERY
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE researches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'interview'
                CHECK (type IN ('interview', 'usability', 'survey', 'data')),
  status        TEXT NOT NULL DEFAULT 'planned'
                CHECK (status IN ('planned', 'ongoing', 'completed')),
  objective     TEXT,
  participants  INT DEFAULT 0,
  owner         TEXT,
  epic_id       UUID REFERENCES epics(id) ON DELETE SET NULL,
  tags          TEXT[] DEFAULT '{}',
  research_date DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE researches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_researches" ON researches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER researches_updated_at BEFORE UPDATE ON researches FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE insights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'behavior'
              CHECK (type IN ('pain', 'opportunity', 'behavior', 'request')),
  severity    TEXT NOT NULL DEFAULT 'medium'
              CHECK (severity IN ('high', 'medium', 'low')),
  research_id UUID REFERENCES researches(id) ON DELETE SET NULL,
  epic_id     UUID REFERENCES epics(id)      ON DELETE SET NULL,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_insights" ON insights FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════
-- 10. COMPETITIVE INTELLIGENCE
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE competitors (
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
CREATE POLICY "auth_all_competitors" ON competitors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER competitors_updated_at BEFORE UPDATE ON competitors FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE competitive_features (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature      TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'Plataforma',
  bloxs        TEXT NOT NULL DEFAULT 'unavailable'
               CHECK (bloxs IN ('available', 'in-dev', 'planned', 'unavailable')),
  availability JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE competitive_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_competitive_features" ON competitive_features FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE competitive_moves (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'feature'
                CHECK (type IN ('feature', 'product', 'pricing', 'growth', 'partnership')),
  description   TEXT NOT NULL,
  impact        TEXT NOT NULL DEFAULT 'médio'
                CHECK (impact IN ('alto', 'médio', 'baixo')),
  move_date     TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX competitive_moves_competitor_id_idx ON competitive_moves(competitor_id);
ALTER TABLE competitive_moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_competitive_moves" ON competitive_moves FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════════════════════════
-- 11. FEATURE FLAGS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE feature_flags (
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
  epic_id     UUID REFERENCES epics(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_feature_flags" ON feature_flags FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════════════════════════════
-- 12. DECISIONS (ADRs)
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE decisions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adr_number   SERIAL NOT NULL,
  title        TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'open'
               CHECK (status IN ('accepted', 'open', 'deprecated', 'superseded')),
  category     TEXT NOT NULL DEFAULT 'produto'
               CHECK (category IN ('produto', 'arquitetura', 'estrategia', 'processo')),
  decided_by   TEXT,
  participants TEXT[] DEFAULT '{}',
  context      TEXT,
  decision     TEXT,
  rationale    TEXT,
  alternatives JSONB DEFAULT '[]',
  consequences TEXT,
  epic_link    TEXT,
  tags         TEXT[] DEFAULT '{}',
  decided_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX decisions_status_idx   ON decisions(status);
CREATE INDEX decisions_category_idx ON decisions(category);
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_decisions" ON decisions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ═════════════════════��══════════════════════════════════════════════
-- 13. RELEASES & CHANGELOG
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE releases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version     TEXT NOT NULL,
  summary     TEXT,
  visibility  TEXT NOT NULL DEFAULT 'internal'
              CHECK (visibility IN ('public', 'internal')),
  sprint_name TEXT,
  released_at TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX releases_released_at_idx ON releases(released_at DESC);
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_releases" ON releases FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE changelog_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id  UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'feature'
              CHECK (type IN ('feature', 'improvement', 'fix', 'breaking')),
  title       TEXT NOT NULL,
  description TEXT,
  task_id     TEXT,
  position    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX changelog_items_release_id_idx ON changelog_items(release_id);
ALTER TABLE changelog_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_changelog_items" ON changelog_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
