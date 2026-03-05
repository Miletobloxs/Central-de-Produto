-- Migration 010: Health Score — Service Checks, Bugs e Incidents
-- Execute no Supabase Dashboard → SQL Editor

-- ══════════════════════════════════════════════════════════════
-- 1. SERVICE_CHECKS — status atual de cada serviço (upsert por nome)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS service_checks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL DEFAULT 'operational'
               CHECK (status IN ('operational', 'degraded', 'outage')),
  latency_ms   INT DEFAULT 0 CHECK (latency_ms >= 0),
  uptime_pct   DECIMAL(5,2) DEFAULT 100.00
               CHECK (uptime_pct >= 0 AND uptime_pct <= 100),
  icon         TEXT DEFAULT 'Globe',   -- nome do ícone Lucide
  notes        TEXT,
  checked_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_service_checks" ON service_checks;
CREATE POLICY "auth_all_service_checks"
  ON service_checks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- 2. BUGS — rastreamento interno por severidade
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bugs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  severity    TEXT NOT NULL DEFAULT 'medium'
              CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'in_progress', 'resolved')),
  sprint_id   TEXT REFERENCES sprints(id) ON DELETE SET NULL,
  epic_id     TEXT REFERENCES epics(id)   ON DELETE SET NULL,
  assignee    TEXT,
  reported_at DATE NOT NULL DEFAULT CURRENT_DATE,
  resolved_at DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bugs_severity_idx ON bugs(severity);
CREATE INDEX IF NOT EXISTS bugs_status_idx   ON bugs(status);

ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_bugs" ON bugs;
CREATE POLICY "auth_all_bugs"
  ON bugs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS bugs_updated_at ON bugs;
CREATE TRIGGER bugs_updated_at
  BEFORE UPDATE ON bugs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 3. INCIDENTS — base para o módulo Incidents (usada também no Health Score)
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS incidents (
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

CREATE INDEX IF NOT EXISTS incidents_status_idx   ON incidents(status);
CREATE INDEX IF NOT EXISTS incidents_severity_idx ON incidents(severity);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_incidents" ON incidents;
CREATE POLICY "auth_all_incidents"
  ON incidents FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS incidents_updated_at ON incidents;
CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
