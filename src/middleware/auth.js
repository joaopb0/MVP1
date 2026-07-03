const database = require('../models/database');

function ensureAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  return next();
}

function requireFuncao(funcao) {
  return (req, res, next) => {
    const user = database.findUserById(req.session.userId);
    if (!user || user.funcao !== funcao) {
      req.session.flash = {
        type: 'danger',
        message: 'Acesso restrito ao perfil autorizado.'
      };
      return res.redirect('/');
    }

    return next();
  };
}

module.exports = {
  ensureAuthenticated,
  requireFuncao
};
