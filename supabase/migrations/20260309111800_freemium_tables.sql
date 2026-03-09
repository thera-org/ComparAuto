-- Tabela: planos_assinatura
CREATE TABLE planos_assinatura (
  id             UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  oficina_id     UUID      NOT NULL REFERENCES oficinas(id),
  tipo_plano     VARCHAR   NOT NULL CHECK (tipo_plano IN ('gratis', 'premium', 'elite')),
  preco_mensal   DECIMAL   DEFAULT 0.00,
  status         VARCHAR   NOT NULL CHECK (status IN ('ativo', 'cancelado', 'inadimplente')),
  data_inicio    TIMESTAMP DEFAULT now(),
  data_renovacao TIMESTAMP,
  cancelado_em   TIMESTAMP
);

-- Tabela: pedidos_orcamento
CREATE TABLE pedidos_orcamento (
  id                 UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id         UUID      NOT NULL REFERENCES usuarios(id),
  oficina_id         UUID      NOT NULL REFERENCES oficinas(id),
  descricao_problema TEXT      NOT NULL,
  veiculo_marca      VARCHAR,
  veiculo_modelo     VARCHAR,
  veiculo_ano        INT,
  status             VARCHAR   NOT NULL DEFAULT 'pendente'
                               CHECK (status IN ('pendente', 'respondido', 'fechado', 'cancelado')),
  criado_em          TIMESTAMP DEFAULT now(),
  respondido_em      TIMESTAMP
);
