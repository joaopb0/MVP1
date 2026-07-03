const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { DatabaseSync } = require('node:sqlite');
const {
  DEFAULT_COMMISSION_PERCENTAGE,
  calcularResumoPedido,
  normalizarNumero
} = require('./services/LucroService');

const databaseDir = path.join(__dirname, 'database');
const databasePath = path.join(databaseDir, 'poc_mvp1.sqlite');
const schemaPath = path.join(__dirname, 'database_setup.sql');

fs.mkdirSync(databaseDir, { recursive: true });

const sqlite = new DatabaseSync(databasePath);
sqlite.exec(fs.readFileSync(schemaPath, 'utf8'));

function isoNow() {
  return new Date().toISOString();
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(value) {
  const date = parseDate(value);
  return (date || new Date()).toISOString();
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    funcao_id: row.funcao_id,
    funcao: row.funcao
  };
}

function mapPedido(row) {
  if (!row) return null;
  return {
    id: row.id,
    nome_cliente: row.nome_cliente,
    plataforma_venda: row.plataforma_venda,
    valor_bruto: normalizarNumero(row.valor_bruto),
    custo_total_fornecedor: normalizarNumero(row.custo_total_fornecedor),
    valor_taxas: normalizarNumero(row.valor_taxas),
    percentual_comissao: normalizarNumero(row.percentual_comissao),
    lucro_liquido: normalizarNumero(row.lucro_liquido),
    comissao_vendedor: normalizarNumero(row.comissao_vendedor),
    status_pedido: row.status_pedido,
    data_pedido: row.data_pedido,
    criado_em: row.criado_em
  };
}

function mapDocumento(row) {
  if (!row) return null;
  return {
    id: row.id,
    pedido_id: row.pedido_id,
    tipo_documento: row.tipo_documento,
    nome_arquivo: row.nome_arquivo,
    caminho_arquivo: row.caminho_arquivo,
    data_upload: row.data_upload,
    pedido: row.pedido_id
      ? {
          id: row.pedido_id,
          nome_cliente: row.nome_cliente
        }
      : null
  };
}

function seedBase() {
  sqlite.exec(`
    INSERT OR IGNORE INTO funcoes (id, nome) VALUES
      (1, 'Gestor'),
      (2, 'Vendedor');
  `);

  const insertUser = sqlite.prepare(`
    INSERT OR IGNORE INTO usuarios (id, username, password, funcao_id)
    VALUES (?, ?, ?, ?)
  `);

  insertUser.run(1, 'gestor', bcrypt.hashSync('123456', 10), 1);
  insertUser.run(2, 'vendedor', bcrypt.hashSync('123456', 10), 2);
}

function seedPedidos() {
  const total = sqlite.prepare('SELECT COUNT(*) AS total FROM pedidos').get().total;
  if (total > 0) return;

  createPedido({
    nome_cliente: 'Cliente Elo7',
    plataforma_venda: 'Elo7',
    valor_bruto: 100,
    valor_taxas: 18,
    custo_total_fornecedor: 40,
    percentual_comissao: 10,
    status_pedido: 'Em producao'
  });

  createPedido({
    nome_cliente: 'Cliente WhatsApp',
    plataforma_venda: 'WhatsApp',
    valor_bruto: 50,
    valor_taxas: 15,
    custo_total_fornecedor: 40,
    percentual_comissao: 10,
    status_pedido: 'Conferencia'
  });
}

function findUserById(id) {
  const row = sqlite
    .prepare(
      `SELECT usuarios.*, funcoes.nome AS funcao
       FROM usuarios
       JOIN funcoes ON funcoes.id = usuarios.funcao_id
       WHERE usuarios.id = ?`
    )
    .get(Number(id));

  return mapUser(row);
}

function findUserByUsername(username) {
  const row = sqlite
    .prepare(
      `SELECT usuarios.*, funcoes.nome AS funcao
       FROM usuarios
       JOIN funcoes ON funcoes.id = usuarios.funcao_id
       WHERE usuarios.username = ?`
    )
    .get(String(username || '').trim());

  return mapUser(row);
}

function listVendedores() {
  return sqlite
    .prepare(
      `SELECT usuarios.*, funcoes.nome AS funcao
       FROM usuarios
       JOIN funcoes ON funcoes.id = usuarios.funcao_id
       WHERE funcoes.nome = 'Vendedor'
       ORDER BY usuarios.username`
    )
    .all()
    .map(mapUser);
}

function createPedido(payload) {
  const resumo = calcularResumoPedido({
    valorBruto: payload.valor_bruto,
    custoFornecedorTotal: payload.custo_total_fornecedor,
    valorTaxas: payload.valor_taxas,
    percentualComissao: payload.percentual_comissao
  });

  const result = sqlite
    .prepare(
      `INSERT INTO pedidos (
        nome_cliente,
        plataforma_venda,
        valor_bruto,
        custo_total_fornecedor,
        valor_taxas,
        percentual_comissao,
        lucro_liquido,
        comissao_vendedor,
        status_pedido,
        data_pedido
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      String(payload.nome_cliente || '').trim(),
      String(payload.plataforma_venda || '').trim(),
      normalizarNumero(payload.valor_bruto),
      normalizarNumero(payload.custo_total_fornecedor),
      normalizarNumero(payload.valor_taxas),
      resumo.percentualComissao,
      resumo.lucroLiquido,
      resumo.comissaoVendedor,
      String(payload.status_pedido || 'Novo').trim(),
      toIsoDate(payload.data_pedido)
    );

  return findPedidoById(result.lastInsertRowid);
}

function listPedidos(filters = {}) {
  const pedidos = sqlite
    .prepare('SELECT * FROM pedidos ORDER BY datetime(data_pedido) DESC, id DESC')
    .all()
    .map(mapPedido);

  const inicio = parseDate(filters.inicio);
  const fim = parseDate(filters.fim);

  return pedidos.filter((pedido) => {
    const dataPedido = parseDate(pedido.data_pedido);
    if (!dataPedido) return false;
    if (inicio && dataPedido < inicio) return false;
    if (fim && dataPedido > fim) return false;
    return true;
  });
}

function findPedidoById(id) {
  const row = sqlite.prepare('SELECT * FROM pedidos WHERE id = ?').get(Number(id));
  return mapPedido(row);
}

function createDocumento(payload) {
  const pedidoId = Number(payload.pedido_id);
  if (!pedidoId || !findPedidoById(pedidoId)) {
    throw new Error('Documento deve estar vinculado a um pedido existente.');
  }

  const result = sqlite
    .prepare(
      `INSERT INTO documentos (
        pedido_id,
        tipo_documento,
        nome_arquivo,
        caminho_arquivo,
        data_upload
      ) VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      pedidoId,
      String(payload.tipo_documento || 'Comprovante').trim(),
      String(payload.nome_arquivo || '').trim(),
      String(payload.caminho_arquivo || '').trim(),
      isoNow()
    );

  return findDocumentoById(result.lastInsertRowid);
}

function listDocumentos(filters = {}) {
  const pedidoId = filters.pedidoId ? Number(filters.pedidoId) : null;
  const sql = `
    SELECT documentos.*, pedidos.nome_cliente
    FROM documentos
    JOIN pedidos ON pedidos.id = documentos.pedido_id
    ${pedidoId ? 'WHERE documentos.pedido_id = ?' : ''}
    ORDER BY datetime(documentos.data_upload) DESC, documentos.id DESC
  `;

  const statement = sqlite.prepare(sql);
  return (pedidoId ? statement.all(pedidoId) : statement.all()).map(mapDocumento);
}

function findDocumentoById(id) {
  const row = sqlite
    .prepare(
      `SELECT documentos.*, pedidos.nome_cliente
       FROM documentos
       JOIN pedidos ON pedidos.id = documentos.pedido_id
       WHERE documentos.id = ?`
    )
    .get(Number(id));

  return mapDocumento(row);
}

function dashboardMetrics(filters = {}) {
  const pedidos = listPedidos(filters);
  const faturamento = pedidos.reduce((total, pedido) => total + pedido.valor_bruto, 0);
  const lucroLiquido = pedidos.reduce((total, pedido) => total + pedido.lucro_liquido, 0);
  const comissoes = pedidos.reduce((total, pedido) => total + pedido.comissao_vendedor, 0);
  const pedidosComPrejuizo = pedidos.filter((pedido) => pedido.lucro_liquido < 0).length;

  return {
    totalPedidos: pedidos.length,
    faturamento,
    lucroLiquido,
    comissoes,
    pedidosComPrejuizo,
    pedidosSemPrejuizo: pedidos.length - pedidosComPrejuizo
  };
}

seedBase();
seedPedidos();

module.exports = {
  DEFAULT_COMMISSION_PERCENTAGE,
  createDocumento,
  createPedido,
  dashboardMetrics,
  findDocumentoById,
  findPedidoById,
  findUserById,
  findUserByUsername,
  listDocumentos,
  listPedidos,
  listVendedores
};
