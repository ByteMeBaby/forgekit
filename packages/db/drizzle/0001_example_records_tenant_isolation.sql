CREATE TABLE example_records (
  id text PRIMARY KEY,
  org_id text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX example_records_org_id_idx ON example_records (org_id);

ALTER TABLE example_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE example_records FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON example_records
  USING (org_id = current_setting('app.current_org_id', true))
  WITH CHECK (org_id = current_setting('app.current_org_id', true));

GRANT SELECT, INSERT, UPDATE, DELETE ON example_records TO forgekit_app, forgekit_operator;
