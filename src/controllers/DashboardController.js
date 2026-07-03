const database = require('../models/database');

function index(req, res) {
  const filters = {
    inicio: req.query.inicio,
    fim: req.query.fim
  };

  res.render('dashboard/index', {
    title: 'Dashboard',
    filters,
    metrics: database.dashboardMetrics(filters),
    pedidos: database.listPedidos(filters),
    lancamentos: database.listLancamentos(filters),
    documentos: database.listDocumentos()
  });
}

module.exports = {
  index
};
