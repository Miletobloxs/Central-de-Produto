-- Migration 021: Cria tabelas de equipe em snake_case
-- Substitui as tabelas PascalCase criadas nas migrations 016/019
-- que eram incompatíveis com o Supabase PostgREST

-- ─── team_groups ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── team_members ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  role       TEXT NOT NULL DEFAULT 'BLOXXS_TEAM',
  group_id   UUID REFERENCES team_groups(id) ON DELETE SET NULL,
  image      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── user_invites ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_invites (
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

DROP POLICY IF EXISTS rls_team_groups  ON team_groups;
DROP POLICY IF EXISTS rls_team_members ON team_members;
DROP POLICY IF EXISTS rls_user_invites ON user_invites;
DROP POLICY IF EXISTS rls_user_invites_anon ON user_invites;

-- Membros autenticados têm acesso total
CREATE POLICY rls_team_groups  ON team_groups  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_team_members ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_user_invites ON user_invites FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anon pode ler convites para validar token (fluxo de aceitar convite)
CREATE POLICY rls_user_invites_anon ON user_invites FOR SELECT TO anon USING (true);

-- ─── Grants ───────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON team_groups, team_members, user_invites TO authenticated;
GRANT SELECT ON user_invites TO anon;
