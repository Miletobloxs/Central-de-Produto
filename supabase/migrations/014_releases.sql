-- Migration 014: Releases & Changelog
-- Execute no Supabase Dashboard → SQL Editor

-- ══════════════════════════════════════════════════════════════
-- 1. RELEASES — versões publicadas
-- ══════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS changelog_items CASCADE;
DROP TABLE IF EXISTS releases CASCADE;

CREATE TABLE releases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version      TEXT NOT NULL,
  summary      TEXT,
  visibility   TEXT NOT NULL DEFAULT 'internal'
               CHECK (visibility IN ('public', 'internal')),
  sprint_name  TEXT,
  released_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX releases_visibility_idx  ON releases(visibility);
CREATE INDEX releases_released_at_idx ON releases(released_at DESC);

ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_releases" ON releases;
CREATE POLICY "auth_all_releases"
  ON releases FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- 2. CHANGELOG_ITEMS — itens de cada release
-- ══════════════════════════════════════════════════════════════
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
CREATE INDEX changelog_items_type_idx       ON changelog_items(type);

ALTER TABLE changelog_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_changelog_items" ON changelog_items;
CREATE POLICY "auth_all_changelog_items"
  ON changelog_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
