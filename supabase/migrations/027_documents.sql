-- Migration 027: Centralizador de Documentos
-- Usa tabela "hub_documents" para evitar conflito com a tabela legada "documents" do Prisma.

-- ── hub_documents ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hub_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'outros'
                CHECK (category IN ('touchpoints','templates','comercial','gtm','outros')),
  file_path   TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_size   BIGINT,
  mime_type   TEXT,
  uploaded_by TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hub_documents_updated_at ON hub_documents;
CREATE TRIGGER hub_documents_updated_at
  BEFORE UPDATE ON hub_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE hub_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_hub_documents ON hub_documents;
CREATE POLICY rls_hub_documents ON hub_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON hub_documents TO authenticated;

-- ── Storage bucket ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS storage_documents_select ON storage.objects;
DROP POLICY IF EXISTS storage_documents_insert ON storage.objects;
DROP POLICY IF EXISTS storage_documents_delete ON storage.objects;

CREATE POLICY storage_documents_select ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents');

CREATE POLICY storage_documents_insert ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

CREATE POLICY storage_documents_delete ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents');

-- ── Reload schema cache ───────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
