const database = require('../models/database');

function index(req, res) {
  res.render('lancamentos/index', {
    title: 'Lancamentos',
    lancamentos: database.listLancamentos()
  });
}

function store(req, res) {
  database.createLancamento(req.body);
  req.session.flash = {
    type: 'success',
    message: 'Lancamento financeiro manual registrado.'
  };
  res.redirect('/lancamentos');
}

module.exports = {
  index,
  store
};
