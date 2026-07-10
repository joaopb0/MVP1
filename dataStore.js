const {
  DEFAULT_COMMISSION_PERCENTAGE,
  calcularResumoPedido,
  normalizarNumero
} = require('./services/LucroService');

let pedidoSequence = 1;
let documentoSequence = 1;

const pedidos = [];
const documentos = [];

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

function clonePedido(pedido) {
  return pedido ? { ...pedido } : null;
}

function cloneDocumento(documento) {
  if (!documento) return null;
  const pedido = findPedidoById(documento.pedido_id);

  return {
    ...documento,
    pedido: pedido
      ? {
          id: pedido.id,
          nome_cliente: pedido.nome_cliente
        }
      : null
  };
}

function createPedido(payload) {
  const resumo = calcularResumoPedido({
    valorBruto: payload.valor_bruto,
    custoFornecedorTotal: payload.custo_total_fornecedor,
    valorTaxas: payload.valor_taxas,
    percentualComissao: payload.percentual_comissao
  });

  const pedido = {
    id: pedidoSequence,
    nome_cliente: String(payload.nome_cliente || '').trim(),
    plataforma_venda: String(payload.plataforma_venda || '').trim(),
    valor_bruto: normalizarNumero(payload.valor_bruto),
    custo_total_fornecedor: normalizarNumero(payload.custo_total_fornecedor),
    valor_taxas: normalizarNumero(payload.valor_taxas),
    percentual_comissao: resumo.percentualComissao,
    lucro_liquido: resumo.lucroLiquido,
    comissao_vendedor: resumo.comissaoVendedor,
    status_pedido: String(payload.status_pedido || 'Novo').trim(),
    data_pedido: toIsoDate(payload.data_pedido),
    criado_em: isoNow()
  };

  pedidoSequence += 1;
  pedidos.push(pedido);
  return clonePedido(pedido);
}

function listPedidos(filters = {}) {
  const inicio = parseDate(filters.inicio);
  const fim = parseDate(filters.fim);

  return pedidos
    .filter((pedido) => {
      const dataPedido = parseDate(pedido.data_pedido);
      if (!dataPedido) return false;
      if (inicio && dataPedido < inicio) return false;
      if (fim && dataPedido > fim) return false;
      return true;
    })
    .sort((a, b) => new Date(b.data_pedido) - new Date(a.data_pedido) || b.id - a.id)
    .map(clonePedido);
}

function findPedidoById(id) {
  return clonePedido(pedidos.find((pedido) => pedido.id === Number(id)));
}

function createDocumento(payload) {
  const pedidoId = Number(payload.pedido_id);
  if (!pedidoId || !findPedidoById(pedidoId)) {
    throw new Error('Documento deve estar vinculado a um pedido existente.');
  }

  const documento = {
    id: documentoSequence,
    pedido_id: pedidoId,
    tipo_documento: String(payload.tipo_documento || 'Comprovante').trim(),
    nome_arquivo: String(payload.nome_arquivo || '').trim(),
    caminho_arquivo: String(payload.caminho_arquivo || '').trim(),
    data_upload: isoNow()
  };

  documentoSequence += 1;
  documentos.push(documento);
  return cloneDocumento(documento);
}

function listDocumentos(filters = {}) {
  const pedidoId = filters.pedidoId ? Number(filters.pedidoId) : null;

  return documentos
    .filter((documento) => !pedidoId || documento.pedido_id === pedidoId)
    .sort((a, b) => new Date(b.data_upload) - new Date(a.data_upload) || b.id - a.id)
    .map(cloneDocumento);
}

function findDocumentoById(id) {
  return cloneDocumento(documentos.find((documento) => documento.id === Number(id)));
}

function dashboardMetrics(filters = {}) {
  const pedidosFiltrados = listPedidos(filters);
  const faturamento = pedidosFiltrados.reduce((total, pedido) => total + pedido.valor_bruto, 0);
  const lucroLiquido = pedidosFiltrados.reduce((total, pedido) => total + pedido.lucro_liquido, 0);
  const comissoes = pedidosFiltrados.reduce((total, pedido) => total + pedido.comissao_vendedor, 0);
  const pedidosComPrejuizo = pedidosFiltrados.filter((pedido) => pedido.lucro_liquido < 0).length;

  return {
    totalPedidos: pedidosFiltrados.length,
    faturamento,
    lucroLiquido,
    comissoes,
    pedidosComPrejuizo,
    pedidosSemPrejuizo: pedidosFiltrados.length - pedidosComPrejuizo
  };
}

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

module.exports = {
  DEFAULT_COMMISSION_PERCENTAGE,
  createDocumento,
  createPedido,
  dashboardMetrics,
  findDocumentoById,
  findPedidoById,
  listDocumentos,
  listPedidos
};
