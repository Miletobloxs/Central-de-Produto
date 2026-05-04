-- ════════════════════════════════════════════════════════════════════
-- Migration 018: Adiciona epic_id à tabela objectives
-- Execute no Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE objectives
  ADD COLUMN IF NOT EXISTS epic_id UUID REFERENCES epics(id) ON DELETE SET NULL;

-- Grant de acesso à nova coluna (herda das políticas RLS existentes)
GRANT SELECT, INSERT, UPDATE, DELETE ON objectives TO anon, authenticated;
