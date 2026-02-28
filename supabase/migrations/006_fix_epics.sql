-- Migration 006: Corrige tabela epics (schema Prisma)
-- Execute no Supabase Dashboard → SQL Editor

-- Adiciona DEFAULT para id (Prisma gerava o CUID no app)
ALTER TABLE epics
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;

-- Adiciona colunas faltantes usadas pela Central de Produto
ALTER TABLE epics ADD COLUMN IF NOT EXISTS color  TEXT DEFAULT 'blue';
ALTER TABLE epics ADD COLUMN IF NOT EXISTS stream TEXT DEFAULT 'Plataforma Core';

-- Habilita RLS e abre acesso a usuários autenticados
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_epics" ON epics;
CREATE POLICY "auth_all_epics"
  ON epics FOR ALL TO authenticated USING (true) WITH CHECK (true);
