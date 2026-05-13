-- Migration 021: Cria tabelas de equipe em snake_case
-- Dropa tabelas criadas pelo Prisma (id TEXT/cuid) que causam
-- conflito de tipo ao referenciar com UUID foreign key.

-- ─── Drop existentes (criadas pelo Prisma com id TEXT) ────────
DROP TABLE IF EXISTS user_invites  CASCADE;
DROP TABLE IF EXISTS team_members  CASCADE;
DROP TABLE IF EXISTS team_groups   CASCADE;

-- ─── team_groups ──────────────────────────────────────────────
CREATE TABLE team_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── team_members ─────────────────────────────────────────────
CREATE TABLE team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  role       TEXT NOT NULL DEFAULT 'BLOXXS_TEAM',
  group_id   UUID REFERENCES team_groups(id) ON DELETE SET NULL,
  image      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── user_invites ─────────────────────────────────────────────
CREATE TABLE user_invites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'BLOXXS_TEAM',
  group_id   UUID REFERENCES team_groups(id) ON DELETE SET NULL,
  token      TEXT NOT NULL UNIQUE,
  status     TEXT NOT NULL DEFAULT 'PENDENTE',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE team_groups  ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_team_groups  ON team_groups  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_team_members ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_user_invites ON user_invites FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_user_invites_anon ON user_invites FOR SELECT TO anon USING (true);

-- ─── Grants ───────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON team_groups, team_members, user_invites TO authenticated;
GRANT SELECT ON user_invites TO anon;
