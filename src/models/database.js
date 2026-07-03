const bcrypt = require('bcrypt');
const { DEFAULT_COMMISSION_PERCENTAGE, calculateProfit, toNumber } = require('../services/profitService');

const funcoes = [
  { id: 1, nome: 'Gestor' },
  { id: 2, nome: 'Vendedor Externo' }
];

const utilizadores = [
  {
    id: 1,
    username: 'gestor',
    password: bcrypt.hashSync('123456', 10),
    funcao_id: 1
  },
  {
    id: 2,
    username: 'vendedor',
    password: bcrypt.hashSync('123456', 10),
    funcao_id: 2
  }
];

let pedidoSequence = 1;
let lancamentoSequence = 1;
let documentoSequence = 1;

const pedidos = [];
const lancamentosManuais = [];
const documentos = [];

function isoNow() {
  return new Date().toISOString();
}

function withUserFunction(user) {
  if (!user) return null;
  const funcao = funcoes.find((item) => item.id === user.funcao_id);
  return {
    ...user,
    funcao: funcao ? funcao.nome : null
  };
}

function findUserById(id) {
  return withUserFunction(utilizadores.find((user) => user.id === Number(id)));
}

function findUserByUsername(username) {
  return withUserFunction(utilizadores.find((user) => user.username === username));
}

function listVendedores() {
  return utilizadores.map(withUserFunction).filter((user) => user.funcao === 'Vendedor Externo');
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function filterByPeriod(items, dateField, filters = {}) {
  const start = parseDate(filters.inicio);
  const end = parseDate(filters.fim);

  return items.filter((item) => {
    const current = parseDate(item[dateField]);
    if (!current) return false;
    if (start && current < start) return false;
    if (end && current > end) return false;
    return true;
  });
}

function buildPedido(payload) {
  const valor_bruto = toNumber(payload.valor_bruto);
  const custo_total_fornecedor = toNumber(payload.custo_total_fornecedor);
  const valor_taxas = toNumber(payload.valor_taxas);
  const { lucroLiquido, comissaoVendedor } = calculateProfit({
    valorBruto: valor_bruto,
    custoTotalFornecedor: custo_total_fornecedor,
    valorTaxas: valor_taxas,
    percentualComissao: DEFAULT_COMMISSION_PERCENTAGE
  });

  return {
    nome_cliente: String(payload.nome_cliente || '').trim(),
    plataforma_venda: String(payload.plataforma_venda || '').trim(),
    valor_bruto,
    custo_total_fornecedor,
    valor_taxas,
    lucro_liquido: lucroLiquido,
    comissao_vendedor: comissaoVendedor,
    vendedor_id: Number(payload.vendedor_id),
    data_pedido: payload.data_pedido ? new Date(payload.data_pedido).toISOString() : isoNow(),
    status_pedido: String(payload.status_pedido || 'Novo').trim()
  };
}

function createPedido(payload) {
  const pedido = {
    id: pedidoSequence,
    ...buildPedido(payload)
  };

  pedidoSequence += 1;
  pedidos.push(pedido);
  return pedido;
}

function updatePedido(id, payload) {
  const index = pedidos.findIndex((pedido) => pedido.id === Number(id));
  if (index === -1) return null;

  pedidos[index] = {
    ...pedidos[index],
    ...buildPedido(payload)
  };

  return pedidos[index];
}

function deletePedido(id) {
  const index = pedidos.findIndex((pedido) => pedido.id === Number(id));
  if (index === -1) return false;
  pedidos.splice(index, 1);
  return true;
}

function listPedidos(filters = {}) {
  return filterByPeriod(pedidos, 'data_pedido', filters).map((pedido) => ({
    ...pedido,
    vendedor: findUserById(pedido.vendedor_id)
  }));
}

function findPedidoById(id) {
  return pedidos.find((pedido) => pedido.id === Number(id));
}

function createLancamento(payload) {
  const lancamento = {
    id: lancamentoSequence,
    categoria: String(payload.categoria || '').trim(),
    descricao: String(payload.descricao || '').trim(),
    valor: toNumber(payload.valor),
    status_pagamento: payload.status_pagamento === 'on' || payload.status_pagamento === 'true',
    data_lancamento: payload.data_lancamento ? new Date(payload.data_lancamento).toISOString() : isoNow()
  };

  lancamentoSequence += 1;
  lancamentosManuais.push(lancamento);
  return lancamento;
}

function listLancamentos(filters = {}) {
  return filterByPeriod(lancamentosManuais, 'data_lancamento', filters);
}

function findLancamentoById(id) {
  return lancamentosManuais.find((lancamento) => lancamento.id === Number(id));
}

function createDocumento(payload) {
  const pedidoId = payload.pedido_id ? Number(payload.pedido_id) : null;
  const lancamentoManualId = payload.lancamento_manual_id ? Number(payload.lancamento_manual_id) : null;

  if ((pedidoId && lancamentoManualId) || (!pedidoId && !lancamentoManualId)) {
    throw new Error('Documento deve estar vinculado a um pedido OU a um lancamento manual.');
  }

  if (pedidoId && !findPedidoById(pedidoId)) {
    throw new Error('Pedido vinculado nao encontrado.');
  }

  if (lancamentoManualId && !findLancamentoById(lancamentoManualId)) {
    throw new Error('Lancamento manual vinculado nao encontrado.');
  }

  const documento = {
    id: documentoSequence,
    tipo_documento: String(payload.tipo_documento || '').trim(),
    nome_arquivo: payload.nome_arquivo,
    caminho_arquivo: payload.caminho_arquivo,
    data_upload: isoNow(),
    pedido_id: pedidoId,
    lancamento_manual_id: lancamentoManualId
  };

  documentoSequence += 1;
  documentos.push(documento);
  return documento;
}

function listDocumentos() {
  return documentos.map((documento) => ({
    ...documento,
    pedido: documento.pedido_id ? findPedidoById(documento.pedido_id) : null,
    lancamento: documento.lancamento_manual_id ? findLancamentoById(documento.lancamento_manual_id) : null
  }));
}

function findDocumentoById(id) {
  return documentos.find((documento) => documento.id === Number(id));
}

function dashboardMetrics(filters = {}) {
  const scopedPedidos = listPedidos(filters);
  const scopedLancamentos = listLancamentos(filters);

  const faturamento = scopedPedidos.reduce((total, pedido) => total + pedido.valor_bruto, 0);
  const lucroLiquido = scopedPedidos.reduce((total, pedido) => total + pedido.lucro_liquido, 0);
  const comissoes = scopedPedidos.reduce((total, pedido) => total + pedido.comissao_vendedor, 0);
  const saldoLancamentos = scopedLancamentos.reduce((total, item) => total + item.valor, 0);

  return {
    totalPedidos: scopedPedidos.length,
    faturamento,
    lucroLiquido,
    comissoes,
    saldoLancamentos
  };
}

createPedido({
  nome_cliente: 'Cliente Elo7',
  plataforma_venda: 'Elo7',
  valor_bruto: 100,
  valor_taxas: 18,
  custo_total_fornecedor: 40,
  vendedor_id: 2,
  status_pedido: 'Em producao'
});

createPedido({
  nome_cliente: 'Cliente WhatsApp',
  plataforma_venda: 'WhatsApp',
  valor_bruto: 50,
  valor_taxas: 15,
  custo_total_fornecedor: 40,
  vendedor_id: 2,
  status_pedido: 'Conferencia'
});

createLancamento({
  categoria: 'Despesa operacional',
  descricao: 'Compra avulsa para producao',
  valor: -25,
  status_pagamento: 'on'
});

module.exports = {
  DEFAULT_COMMISSION_PERCENTAGE,
  createDocumento,
  createLancamento,
  createPedido,
  dashboardMetrics,
  deletePedido,
  findDocumentoById,
  findPedidoById,
  findUserById,
  findUserByUsername,
  listDocumentos,
  listLancamentos,
  listPedidos,
  listVendedores,
  updatePedido
};
