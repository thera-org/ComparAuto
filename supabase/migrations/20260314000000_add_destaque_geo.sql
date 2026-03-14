-- supabase/migrations/20260314000000_add_destaque_geo.sql

-- 1. Garantir que latitude/longitude existem como colunas reais
ALTER TABLE oficinas
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 2. Adicionar suporte a destaque pago
ALTER TABLE oficinas
  ADD COLUMN IF NOT EXISTS destaque BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS destaque_ate TIMESTAMPTZ;

-- 3. Índices para queries de busca pública
CREATE INDEX IF NOT EXISTS idx_oficinas_status
  ON oficinas(status);

CREATE INDEX IF NOT EXISTS idx_oficinas_destaque
  ON oficinas(destaque) WHERE destaque = true;

CREATE INDEX IF NOT EXISTS idx_oficinas_status_destaque
  ON oficinas(status, destaque);

-- 4. Comentários de documentação
COMMENT ON COLUMN oficinas.destaque IS
  'Se true e destaque_ate > now(), oficina aparece no topo dos resultados com badge dourado';
COMMENT ON COLUMN oficinas.destaque_ate IS
  'Data de expiração do destaque. NULL ou data passada = sem destaque ativo';
COMMENT ON COLUMN oficinas.latitude IS 'Latitude WGS84 da oficina';
COMMENT ON COLUMN oficinas.longitude IS 'Longitude WGS84 da oficina';
