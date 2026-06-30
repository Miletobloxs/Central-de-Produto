-- 028_pnl_fields.sql
-- Adiciona campos de P&L (econômicos) a tabelas existentes.
-- Totalmente idempotente: ADD COLUMN IF NOT EXISTS + DEFAULT.

ALTER TABLE epics
  ADD COLUMN IF NOT EXISTS fixed_cost_estimado  NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS receita_desbloqueada NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS air_estimado         NUMERIC(5,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tipo_custo_dominante TEXT,
  ADD COLUMN IF NOT EXISTS moat_classificacao   TEXT,
  ADD COLUMN IF NOT EXISTS tipo_produto         TEXT,
  ADD COLUMN IF NOT EXISTS clientes_vinculados  TEXT[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rice_score           NUMERIC(8,2)  DEFAULT 0;

ALTER TABLE sprints
  ADD COLUMN IF NOT EXISTS kpi_negocio_alvo TEXT,
  ADD COLUMN IF NOT EXISTS tem_ai_cogs      BOOLEAN DEFAULT false;

ALTER TABLE sprint_reviews
  ADD COLUMN IF NOT EXISTS fixed_cost_realizado NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS receita_realizada    NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_cogs_realizado    NUMERIC(14,2) DEFAULT 0;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS ai_cogs_estimado NUMERIC(12,2) DEFAULT 0;

NOTIFY pgrst, 'reload schema';
