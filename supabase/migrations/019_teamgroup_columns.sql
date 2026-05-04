-- ════════════════════════════════════════════════════════════════════
-- Migration 019: Cria tabelas de auth (TeamGroup, User, UserInvite)
-- caso não existam, e adiciona colunas faltantes.
-- Execute no Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════════════

-- ─── TeamGroup ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "TeamGroup" (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL UNIQUE,
  description  TEXT,
  permissions  TEXT[] DEFAULT '{}',
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adiciona colunas se a tabela já existir sem elas
ALTER TABLE "TeamGroup"
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}';

-- ─── User ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "User" (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT,
  role        TEXT NOT NULL DEFAULT 'INVESTIDOR',
  "groupId"   UUID REFERENCES "TeamGroup"(id) ON DELETE SET NULL,
  avatar      TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS avatar TEXT;

-- ─── UserInvite ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "UserInvite" (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'INVESTIDOR',
  token       TEXT NOT NULL UNIQUE,
  "groupId"   UUID REFERENCES "TeamGroup"(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'PENDENTE',
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RLS ─────────────────────────────────────────────────────────
ALTER TABLE "TeamGroup"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserInvite" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS auth_all_teamgroup  ON "TeamGroup";
DROP POLICY IF EXISTS auth_all_user       ON "User";
DROP POLICY IF EXISTS auth_all_userinvite ON "UserInvite";

CREATE POLICY auth_all_teamgroup  ON "TeamGroup"  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY auth_all_user       ON "User"       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY auth_all_userinvite ON "UserInvite" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Grants ──────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON "TeamGroup", "User", "UserInvite" TO anon, authenticated, service_role;
