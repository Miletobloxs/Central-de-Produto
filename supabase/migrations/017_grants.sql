-- ════════════════════════════════════════════════════════════════════
-- Migration 017: Schema + Table grants para anon e authenticated
-- Execute APÓS 015 e 016 no Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════════════════

-- Permissão de acesso ao schema public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Permissões em todas as tabelas existentes
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- Permissões em todas as sequences existentes
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Default privileges para tabelas criadas no futuro
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
