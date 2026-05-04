-- ════════════════════════════════════════════════════════════════════
-- Migration 019: Adiciona colunas faltantes em TeamGroup e User
-- Execute no Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════════════

-- Adiciona colunas faltantes em TeamGroup
ALTER TABLE "TeamGroup"
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}';

-- Adiciona avatar em User (usado pelo team module)
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Garante que as políticas RLS existam para as tabelas de auth
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'User' AND policyname = 'auth_all__user_'
  ) THEN
    ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
    CREATE POLICY auth_all__user_ ON "User" FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'TeamGroup' AND policyname = 'auth_all__teamgroup_'
  ) THEN
    ALTER TABLE "TeamGroup" ENABLE ROW LEVEL SECURITY;
    CREATE POLICY auth_all__teamgroup_ ON "TeamGroup" FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'UserInvite' AND policyname = 'auth_all__userinvite_'
  ) THEN
    ALTER TABLE "UserInvite" ENABLE ROW LEVEL SECURITY;
    CREATE POLICY auth_all__userinvite_ ON "UserInvite" FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON "User", "TeamGroup", "UserInvite" TO anon, authenticated;
