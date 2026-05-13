-- Migration 022: Atualiza status do backlog para workflow por coluna
-- Remove o framework MoSCoW das colunas, status passa a ser o workflow de entrega

-- Remove constraint antiga (se existir)
ALTER TABLE backlog_items DROP CONSTRAINT IF EXISTS backlog_items_status_check;

-- Converte valores existentes
UPDATE backlog_items SET status = 'todo'        WHERE status IN ('open')     OR status IS NULL;
UPDATE backlog_items SET status = 'in_progress' WHERE status IN ('in_sprint');

-- Garante que nenhum valor inválido sobrou
UPDATE backlog_items SET status = 'todo' WHERE status NOT IN ('todo', 'in_progress', 'review', 'entregue');

-- Nova constraint
ALTER TABLE backlog_items ADD CONSTRAINT backlog_items_status_check
  CHECK (status IN ('todo', 'in_progress', 'review', 'entregue'));
