CREATE TABLE funcoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE utilizadores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  funcao_id INT NOT NULL,
  FOREIGN KEY (funcao_id) REFERENCES funcoes(id)
);

CREATE TABLE pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome_cliente VARCHAR(255) NOT NULL,
  plataforma_venda VARCHAR(100) NOT NULL,
  valor_bruto DECIMAL(10,2) NOT NULL,
  custo_total_fornecedor DECIMAL(10,2) NOT NULL,
  valor_taxas DECIMAL(10,2) NOT NULL,
  lucro_liquido DECIMAL(10,2) NOT NULL,
  comissao_vendedor DECIMAL(10,2) NOT NULL,
  vendedor_id INT NOT NULL,
  data_pedido DATETIME NOT NULL,
  status_pedido VARCHAR(50) NOT NULL,
  FOREIGN KEY (vendedor_id) REFERENCES utilizadores(id)
);

CREATE TABLE lancamentos_manuais (
  id INT PRIMARY KEY AUTO_INCREMENT,
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  status_pagamento BOOLEAN NOT NULL,
  data_lancamento DATETIME NOT NULL
);

CREATE TABLE documentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo_documento VARCHAR(50) NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  caminho_arquivo VARCHAR(255) NOT NULL,
  data_upload DATETIME NOT NULL,
  pedido_id INT,
  lancamento_manual_id INT,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (lancamento_manual_id) REFERENCES lancamentos_manuais(id),
  CHECK (
    (pedido_id IS NOT NULL AND lancamento_manual_id IS NULL)
    OR
    (pedido_id IS NULL AND lancamento_manual_id IS NOT NULL)
  )
);
