-- Migration 008: Corrige colunas NOT NULL sem DEFAULT nas tabelas Prisma
-- Execute no Supabase Dashboard → SQL Editor

-- ══════════════════════════════════════════════════════════════
-- SPRINTS
-- Problema: startDate, endDate, updatedAt são NOT NULL sem DEFAULT
-- Nosso INSERT só passa name/goal/status → falha silenciosamente
-- ══════════════════════════════════════════════════════════════

-- Torna startDate e endDate opcionais (campos de data da sprint são definidos depois)
ALTER TABLE sprints ALTER COLUMN "startDate" DROP NOT NULL;
ALTER TABLE sprints ALTER COLUMN "endDate"   DROP NOT NULL;

-- Adiciona DEFAULT NOW() para auto-preencher em INSERTs
ALTER TABLE sprints ALTER COLUMN "updatedAt" SET DEFAULT NOW();
ALTER TABLE sprints ALTER COLUMN "createdAt" SET DEFAULT NOW();

-- ══════════════════════════════════════════════════════════════
-- EPICS
-- Problema: updatedAt e createdAt são NOT NULL sem DEFAULT
-- Nosso INSERT não passa esses campos → falha com constraint error
-- ══════════════════════════════════════════════════════════════

ALTER TABLE epics ALTER COLUMN "updatedAt" SET DEFAULT NOW();
ALTER TABLE epics ALTER COLUMN "createdAt" SET DEFAULT NOW();
