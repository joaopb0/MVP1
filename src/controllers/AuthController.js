const bcrypt = require('bcrypt');
const database = require('../models/database');

function loginView(req, res) {
  res.render('auth/login', {
    title: 'Login',
    error: null
  });
}

async function authenticate(req, res) {
  const user = database.findUserByUsername(req.body.username);

  if (!user) {
    return res.status(401).render('auth/login', {
      title: 'Login',
      error: 'Usuario ou senha invalidos.'
    });
  }

  const passwordOk = await bcrypt.compare(req.body.password || '', user.password);

  if (!passwordOk) {
    return res.status(401).render('auth/login', {
      title: 'Login',
      error: 'Usuario ou senha invalidos.'
    });
  }

  req.session.userId = user.id;
  return res.redirect(user.funcao === 'Vendedor Externo' ? '/pedidos' : '/');
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}

module.exports = {
  authenticate,
  loginView,
  logout
};
