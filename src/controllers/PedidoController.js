const database = require('../models/database');

function index(req, res) {
  res.render('pedidos/index', {
    title: 'Pedidos',
    pedidos: database.listPedidos(),
    vendedores: database.listVendedores(),
    documentos: database.listDocumentos(),
    lancamentos: database.listLancamentos(),
    percentualComissao: database.DEFAULT_COMMISSION_PERCENTAGE
  });
}

function store(req, res) {
  database.createPedido(req.body);
  req.session.flash = {
    type: 'success',
    message: 'Pedido registrado com calculo de lucro e comissao.'
  };
  res.redirect('/pedidos');
}

function update(req, res) {
  const pedido = database.updatePedido(req.params.id, req.body);
  req.session.flash = pedido
    ? { type: 'success', message: 'Pedido atualizado e recalculado.' }
    : { type: 'danger', message: 'Pedido nao encontrado.' };

  res.redirect('/pedidos');
}

function destroy(req, res) {
  const removed = database.deletePedido(req.params.id);
  req.session.flash = removed
    ? { type: 'success', message: 'Pedido excluido.' }
    : { type: 'danger', message: 'Pedido nao encontrado.' };

  res.redirect('/pedidos');
}

module.exports = {
  destroy,
  index,
  store,
  update
};
