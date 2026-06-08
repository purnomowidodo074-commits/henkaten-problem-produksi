CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  line TEXT NOT NULL,
  "jenisProblem" TEXT NOT NULL,
  problem TEXT NOT NULL,
  "namaMesin" TEXT NOT NULL,
  "planningPerbaikan" TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'On progress',
  keterangan TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER problems_updated_at
  BEFORE UPDATE ON problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
