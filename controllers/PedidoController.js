const fs = require('fs');
const database = require('../db');

function index(req, res) {
  res.render('pedidos/index', {
    title: 'Pedidos',
    pedidos: database.listPedidos(),
    documentos: database.listDocumentos()
  });
}

function novo(req, res) {
  res.render('pedidos/novo', {
    title: 'Novo pedido',
    defaultCommission: database.DEFAULT_COMMISSION_PERCENTAGE * 100
  });
}

function store(req, res) {
  let pedido;

  try {
    pedido = database.createPedido(req.body);

    if (req.file) {
      database.createDocumento({
        pedido_id: pedido.id,
        tipo_documento: req.body.tipo_documento,
        nome_arquivo: req.file.originalname,
        caminho_arquivo: req.file.path
      });
    }

    req.session.flash = {
      type: 'success',
      message: 'Pedido registrado com lucro liquido real e comissao calculados.'
    };
    return res.redirect(`/pedidos/${pedido.id}`);
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});

    req.session.flash = {
      type: 'danger',
      message: error.message
    };
    return res.redirect('/pedidos/novo');
  }
}

function show(req, res) {
  const pedido = database.findPedidoById(req.params.id);

  if (!pedido) {
    req.session.flash = {
      type: 'danger',
      message: 'Pedido nao encontrado.'
    };
    return res.redirect('/pedidos');
  }

  return res.render('pedidos/show', {
    title: `Pedido #${pedido.id}`,
    pedido,
    documentos: database.listDocumentos({ pedidoId: pedido.id })
  });
}

function storeDocumento(req, res) {
  const pedido = database.findPedidoById(req.params.id);

  if (!pedido) {
    if (req.file) fs.unlink(req.file.path, () => {});
    req.session.flash = {
      type: 'danger',
      message: 'Pedido nao encontrado.'
    };
    return res.redirect('/pedidos');
  }

  if (!req.file) {
    req.session.flash = {
      type: 'danger',
      message: 'Selecione um documento para vincular ao pedido.'
    };
    return res.redirect(`/pedidos/${pedido.id}`);
  }

  database.createDocumento({
    pedido_id: pedido.id,
    tipo_documento: req.body.tipo_documento,
    nome_arquivo: req.file.originalname,
    caminho_arquivo: req.file.path
  });

  req.session.flash = {
    type: 'success',
    message: 'Documento vinculado ao pedido.'
  };
  return res.redirect(`/pedidos/${pedido.id}`);
}

module.exports = {
  index,
  novo,
  show,
  store,
  storeDocumento
};
