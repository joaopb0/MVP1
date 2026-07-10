const fs = require('fs');
const dataStore = require('../dataStore');

function redirectWithMessage(res, path, type, message) {
  const param = type === 'success' ? 'success' : 'error';
  return res.redirect(`${path}?${param}=${encodeURIComponent(message)}`);
}

function index(req, res) {
  res.render('pedidos/index', {
    title: 'Pedidos',
    pedidos: dataStore.listPedidos(),
    documentos: dataStore.listDocumentos()
  });
}

function novo(req, res) {
  res.render('pedidos/novo', {
    title: 'Novo pedido',
    defaultCommission: dataStore.DEFAULT_COMMISSION_PERCENTAGE * 100
  });
}

function store(req, res) {
  let pedido;

  try {
    pedido = dataStore.createPedido(req.body);

    if (req.file) {
      dataStore.createDocumento({
        pedido_id: pedido.id,
        tipo_documento: req.body.tipo_documento,
        nome_arquivo: req.file.originalname,
        caminho_arquivo: req.file.path
      });
    }

    return redirectWithMessage(
      res,
      `/pedidos/${pedido.id}`,
      'success',
      'Pedido registrado com lucro liquido real e comissao calculados.'
    );
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});

    return redirectWithMessage(res, '/pedidos/novo', 'error', error.message);
  }
}

function show(req, res) {
  const pedido = dataStore.findPedidoById(req.params.id);

  if (!pedido) {
    return redirectWithMessage(res, '/pedidos', 'error', 'Pedido nao encontrado.');
  }

  return res.render('pedidos/show', {
    title: `Pedido #${pedido.id}`,
    pedido,
    documentos: dataStore.listDocumentos({ pedidoId: pedido.id })
  });
}

function storeDocumento(req, res) {
  const pedido = dataStore.findPedidoById(req.params.id);

  if (!pedido) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return redirectWithMessage(res, '/pedidos', 'error', 'Pedido nao encontrado.');
  }

  if (!req.file) {
    return redirectWithMessage(
      res,
      `/pedidos/${pedido.id}`,
      'error',
      'Selecione um documento para vincular ao pedido.'
    );
  }

  dataStore.createDocumento({
    pedido_id: pedido.id,
    tipo_documento: req.body.tipo_documento,
    nome_arquivo: req.file.originalname,
    caminho_arquivo: req.file.path
  });

  return redirectWithMessage(res, `/pedidos/${pedido.id}`, 'success', 'Documento vinculado ao pedido.');
}

module.exports = {
  index,
  novo,
  show,
  store,
  storeDocumento
};
