-- ============================================================
-- 016_complete_schema.sql
-- Complete schema reset — applied 2026-03-23 via Supabase MCP
-- Fixes: end_date on sprints, released_at on releases,
--        feedback_entries table, alternatives on decisions,
--        researches table, and all other missing tables
-- ============================================================

-- Utility: updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── AUTH / TEAM ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "TeamGroup" (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "User" (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL UNIQUE,
  name         TEXT,
  role         TEXT NOT NULL DEFAULT 'viewer',
  "groupId"    UUID REFERENCES "TeamGroup"(id),
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "UserInvite" (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'viewer',
  token       TEXT NOT NULL UNIQUE,
  "groupId"   UUID REFERENCES "TeamGroup"(id),
  "usedAt"    TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── EPICS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS epics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  stream      TEXT,
  status      TEXT NOT NULL DEFAULT 'planned',
  priority    TEXT NOT NULL DEFAULT 'medium',
  color       TEXT NOT NULL DEFAULT 'blue',
  start_date  DATE,
  end_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER epics_updated_at
  BEFORE UPDATE ON epics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── SPRINTS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sprints (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  goal       TEXT,
  status     TEXT NOT NULL DEFAULT 'planning'
               CHECK (status IN ('planning','active','completed','cancelled')),
  start_date DATE,
  end_date   DATE,
  velocity   INT DEFAULT 0,
  epic_id    UUID REFERENCES epics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── TASKS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'todo',
  priority       TEXT NOT NULL DEFAULT 'medium',
  story_points   INT,
  sprint_id      UUID REFERENCES sprints(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── BACKLOG ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS backlog_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  type         TEXT NOT NULL DEFAULT 'feature',
  priority     TEXT NOT NULL DEFAULT 'medium',
  status       TEXT NOT NULL DEFAULT 'new',
  story_points INT,
  sprint_id    UUID REFERENCES sprints(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER backlog_items_updated_at
  BEFORE UPDATE ON backlog_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RELEASES ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS releases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version      TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  sprint_name  TEXT,
  released_at  DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CHANGELOG ITEMS ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS changelog_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id  UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'feature',
  description TEXT NOT NULL,
  position    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── FEATURE FLAGS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feature_flags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  is_dev        BOOLEAN NOT NULL DEFAULT false,
  is_staging    BOOLEAN NOT NULL DEFAULT false,
  is_prod       BOOLEAN NOT NULL DEFAULT false,
  owner         TEXT,
  tags          TEXT[] DEFAULT '{}',
  last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── FLAG AUDIT ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS flag_audits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id    UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  changed_by TEXT NOT NULL,
  field      TEXT NOT NULL,
  old_value  TEXT,
  new_value  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── DECISIONS / ADR ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS decisions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  context      TEXT,
  decision     TEXT,
  status       TEXT NOT NULL DEFAULT 'proposed',
  category     TEXT,
  adr_number   SERIAL,
  decided_by   TEXT,
  participants TEXT[] DEFAULT '{}',
  rationale    TEXT,
  alternatives JSONB DEFAULT '[]',
  epic_link    TEXT,
  tags         TEXT[] DEFAULT '{}',
  decided_at   DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER decisions_updated_at
  BEFORE UPDATE ON decisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INCIDENTS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS incidents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  severity       TEXT NOT NULL DEFAULT 'low',
  status         TEXT NOT NULL DEFAULT 'open',
  affected_users INT,
  affected_pct   NUMERIC(5,2),
  started_at     TIMESTAMPTZ,
  resolved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── FEEDBACK ENTRIES ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS feedback_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source      TEXT NOT NULL DEFAULT 'manual',
  category    TEXT,
  sentiment   TEXT,
  content     TEXT NOT NULL,
  user_name   TEXT,
  user_email  TEXT,
  sprint_id   UUID REFERENCES sprints(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── NPS MONTHLY ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS nps_monthly (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month        TEXT NOT NULL,
  score        NUMERIC(4,1) NOT NULL,
  promoters    INT NOT NULL DEFAULT 0,
  passives     INT NOT NULL DEFAULT 0,
  detractors   INT NOT NULL DEFAULT 0,
  total        INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RESEARCH ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS researches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL DEFAULT 'qualitative',
  status        TEXT NOT NULL DEFAULT 'planned',
  started_at    DATE,
  ended_at      DATE,
  participants  INT DEFAULT 0,
  insights_url  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER researches_updated_at
  BEFORE UPDATE ON researches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── INSIGHTS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS insights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id  UUID REFERENCES researches(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  category     TEXT,
  impact       TEXT DEFAULT 'medium',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SERVICE CHECKS (Health) ────────────────────────────────

CREATE TABLE IF NOT EXISTS service_checks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  url         TEXT,
  status      TEXT NOT NULL DEFAULT 'operational',
  latency_ms  INT,
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── BUGS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bugs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  severity     TEXT NOT NULL DEFAULT 'low',
  status       TEXT NOT NULL DEFAULT 'open',
  reporter     TEXT,
  sprint_id    UUID REFERENCES sprints(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER bugs_updated_at
  BEFORE UPDATE ON bugs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── COMPETITIVE ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS competitors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL UNIQUE,
  description  TEXT,
  website      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER competitors_updated_at
  BEFORE UPDATE ON competitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS competitive_features (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id  UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'identified',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitive_moves (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id  UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  impact         TEXT DEFAULT 'medium',
  date           DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RLS POLICIES ───────────────────────────────────────────

DO $$ DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    '"TeamGroup"','"User"','"UserInvite"',
    'epics','sprints','tasks','backlog_items',
    'releases','changelog_items',
    'feature_flags','flag_audits',
    'decisions','incidents',
    'feedback_entries','nps_monthly',
    'researches','insights',
    'service_checks','bugs',
    'competitors','competitive_features','competitive_moves'
  ]) LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'DROP POLICY IF EXISTS auth_all_%s ON %s',
      regexp_replace(t, '[^a-z0-9]', '_', 'g'), t
    );
    EXECUTE format(
      'CREATE POLICY auth_all_%s ON %s FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      regexp_replace(t, '[^a-z0-9]', '_', 'g'), t
    );
  END LOOP;
END $$;
