CREATE TABLE IF NOT EXISTS settings_options (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (type, value)
);

INSERT INTO settings_options (type, value) VALUES
  ('line', 'Mel-Pour-Analys'),
  ('line', 'Moulding'),
  ('line', 'RCS'),
  ('line', 'Core Making'),
  ('line', 'Finishing'),
  ('line', 'Maintenance'),
  ('line', 'Die Press'),
  ('pic', 'Maintenance'),
  ('pic', 'Engser'),
  ('pic', 'Kaizen'),
  ('pic', 'Produksi')
ON CONFLICT (type, value) DO NOTHING;
