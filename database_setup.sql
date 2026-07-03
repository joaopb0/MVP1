PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS funcoes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  funcao_id INTEGER NOT NULL,
  FOREIGN KEY (funcao_id) REFERENCES funcoes(id)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_cliente TEXT NOT NULL,
  plataforma_venda TEXT NOT NULL,
  valor_bruto REAL NOT NULL DEFAULT 0,
  custo_total_fornecedor REAL NOT NULL DEFAULT 0,
  valor_taxas REAL NOT NULL DEFAULT 0,
  percentual_comissao REAL NOT NULL DEFAULT 0,
  lucro_liquido REAL NOT NULL DEFAULT 0,
  comissao_vendedor REAL NOT NULL DEFAULT 0,
  status_pedido TEXT NOT NULL DEFAULT 'Novo',
  data_pedido TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL,
  tipo_documento TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  caminho_arquivo TEXT NOT NULL,
  data_upload TEXT NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);
