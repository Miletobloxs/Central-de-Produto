-- Migration 023: Adiciona complexidade e estimativa de horas às tasks
-- A cascata é calculada no frontend: subtask → task → sprint → épico

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS complexity     TEXT    NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS estimate_hours NUMERIC(6,1) NOT NULL DEFAULT 0;

ALTER TABLE tasks
  ADD CONSTRAINT tasks_complexity_check
  CHECK (complexity IN ('low', 'medium', 'high', 'critical'));
