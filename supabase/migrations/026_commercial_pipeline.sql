-- Migration 026: Gate Comercial IBaaS
-- Kanban de pipeline comercial — independente do core (épicos/sprints/OKRs).

-- ── commercial_clients ────────────────────────────────────────────────────────
CREATE TABLE commercial_clients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name        TEXT NOT NULL,
  contact_name        TEXT,
  contact_email       TEXT,
  stage               TEXT NOT NULL DEFAULT 'contact'
                        CHECK (stage IN ('contact','nda','proposal','homologation','active','closed')),
  product_type        TEXT[] DEFAULT '{}',
  origin_channel      TEXT CHECK (origin_channel IN ('inbound','partner','outbound','existing')),
  hubspot_deal_id     TEXT,
  nda_sent_at         TIMESTAMPTZ,
  nda_signed_at       TIMESTAMPTZ,
  nda_url             TEXT,
  contract_sent_at    TIMESTAMPTZ,
  contract_signed_at  TIMESTAMPTZ,
  contract_url        TEXT,
  contract_mrr        NUMERIC(12,2),
  portal_access_at    TIMESTAMPTZ,
  go_live_at          TIMESTAMPTZ,
  epic_ids            TEXT[] DEFAULT '{}',
  blockers            TEXT,
  closed_reason       TEXT CHECK (closed_reason IN ('churn','lost','disqualified')),
  notes               TEXT,
  owner               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── commercial_activities ─────────────────────────────────────────────────────
CREATE TABLE commercial_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES commercial_clients(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'meeting','email','call','nda_sent','nda_signed',
    'contract_sent','contract_signed','go_live','note','stage_change'
  )),
  title         TEXT NOT NULL,
  description   TEXT,
  stage_from    TEXT,
  stage_to      TEXT,
  recorded_by   TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER commercial_clients_updated_at
  BEFORE UPDATE ON commercial_clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE commercial_clients    ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_commercial_clients    ON commercial_clients    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY rls_commercial_activities ON commercial_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON commercial_clients, commercial_activities TO authenticated;

-- ── Seed: 7 clientes iniciais ─────────────────────────────────────────────────
INSERT INTO commercial_clients (company_name, stage, product_type, origin_channel) VALUES
  ('Gaia Impacto Securitizadora', 'active',      ARRAY['white_label'],           'existing'),
  ('Canal Securitizadora',        'nda',          ARRAY['ibaas', 'white_label'],  'partner'),
  ('IB3',                         'proposal',     ARRAY['ibaas'],                 'existing'),
  ('Neela',                       'homologation', ARRAY['white_label', 'ibaas'],  'existing'),
  ('V3',                          'homologation', ARRAY['white_label'],           'existing'),
  ('Rise / Omex',                 'active',       ARRAY['ca'],                    'existing'),
  ('thecash',                     'active',       ARRAY['dcc'],                   'existing');
