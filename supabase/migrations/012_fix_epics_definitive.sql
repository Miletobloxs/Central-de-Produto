-- Migration 012: Fix definitivo da tabela epics
-- Resolve: id sem DEFAULT, ENUMs (RoadmapStatus, priority), colunas faltantes
-- Execute no Supabase Dashboard → SQL Editor
-- Seguro para rodar múltiplas vezes (idempotente)

-- ════════════════════════════════════════════════════════════
-- 0. DROPAR TRIGGER ANTES DOS UPDATEs
-- (trigger update_updated_at() usa updated_at snake_case, mas Prisma cria updatedAt)
-- ════════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS epics_updated_at ON epics;

-- ════════════════════════════════════════════════════════════
-- 1. RENOMEAR title → name (migration 003 criava 'title', app espera 'name')
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'epics' AND column_name = 'title'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'epics' AND column_name = 'name'
  ) THEN
    ALTER TABLE epics RENAME COLUMN title TO name;
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════
-- 2. ADICIONAR DEFAULT AO id
-- ════════════════════════════════════════════════════════════
ALTER TABLE epics ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;

-- ════════════════════════════════════════════════════════════
-- 2. CONVERTER status DE ENUM (RoadmapStatus) PARA TEXT
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'epics'
      AND column_name = 'status'
      AND udt_name NOT IN ('text', 'varchar')
  ) THEN
    ALTER TABLE epics ALTER COLUMN status TYPE TEXT USING status::TEXT;
  END IF;
END $$;

-- Normaliza valores ENUM legados para lowercase snake_case
UPDATE epics
SET status = CASE
  WHEN UPPER(status) = 'IN_PROGRESS' THEN 'in_progress'
  WHEN UPPER(status) = 'PLANNED'     THEN 'planned'
  WHEN UPPER(status) = 'COMPLETED'   THEN 'completed'
  WHEN UPPER(status) = 'DELAYED'     THEN 'delayed'
  ELSE LOWER(REPLACE(status, ' ', '_'))
END
WHERE status IS NOT NULL;

ALTER TABLE epics ALTER COLUMN status SET DEFAULT 'planned';

-- ════════════════════════════════════════════════════════════
-- 2. CONVERTER priority DE ENUM PARA TEXT (se ainda for ENUM)
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'epics'
      AND column_name = 'priority'
      AND udt_name NOT IN ('text', 'varchar')
  ) THEN
    ALTER TABLE epics ALTER COLUMN priority TYPE TEXT USING priority::TEXT;
  END IF;
END $$;

UPDATE epics
SET priority = LOWER(priority)
WHERE priority IS NOT NULL;

ALTER TABLE epics ALTER COLUMN priority SET DEFAULT 'medium';

-- ════════════════════════════════════════════════════════════
-- 3. ADICIONAR COLUNAS FALTANTES
-- ════════════════════════════════════════════════════════════
ALTER TABLE epics ADD COLUMN IF NOT EXISTS color       TEXT DEFAULT 'blue';
ALTER TABLE epics ADD COLUMN IF NOT EXISTS stream      TEXT DEFAULT 'Plataforma Core';
ALTER TABLE epics ADD COLUMN IF NOT EXISTS description TEXT;

-- Preenche NULLs em registros existentes
UPDATE epics SET color  = 'blue'            WHERE color  IS NULL;
UPDATE epics SET stream = 'Plataforma Core' WHERE stream IS NULL;

-- ════════════════════════════════════════════════════════════
-- 4. GARANTIR DEFAULT em timestamps (compatibilidade Prisma)
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  -- camelCase (tabela criada pelo Prisma)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='epics' AND column_name='createdAt') THEN
    ALTER TABLE epics ALTER COLUMN "createdAt" SET DEFAULT NOW();
    ALTER TABLE epics ALTER COLUMN "updatedAt" SET DEFAULT NOW();
  END IF;
  -- snake_case (tabela criada pela migration 003)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='epics' AND column_name='created_at') THEN
    ALTER TABLE epics ALTER COLUMN created_at SET DEFAULT NOW();
    ALTER TABLE epics ALTER COLUMN updated_at SET DEFAULT NOW();
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════
-- 5. RLS (idempotente)
-- ════════════════════════════════════════════════════════════
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_all_epics" ON epics;
CREATE POLICY "auth_all_epics"
  ON epics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- 5b. RECRIAR TRIGGER (só se coluna for updated_at snake_case)
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'epics' AND column_name = 'updated_at'
  ) THEN
    CREATE OR REPLACE TRIGGER epics_updated_at
      BEFORE UPDATE ON epics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════
-- 6. REFRESH DO SCHEMA CACHE DO POSTGREST
-- ════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
