const dataStore = require('../dataStore');

function index(req, res) {
  const filters = {
    inicio: req.query.inicio,
    fim: req.query.fim
  };

  res.render('dashboard/index', {
    title: 'Dashboard',
    filters,
    metrics: dataStore.dashboardMetrics(filters),
    pedidos: dataStore.listPedidos(filters)
  });
}

module.exports = {
  index
};
