-- 029_pnl_gate_checks.sql
-- Cria tabela de status dos gates de P&L por épico.
-- Idempotente: IF NOT EXISTS em todo DDL.

CREATE TABLE IF NOT EXISTS epic_gate_checks (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id        UUID        REFERENCES epics(id) ON DELETE CASCADE,
  gate_code      TEXT        NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pass','warn','fail','pending')),
  computed_value NUMERIC,
  note           TEXT,
  checked_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gate_checks_epic ON epic_gate_checks(epic_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON epic_gate_checks TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
