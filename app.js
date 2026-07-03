const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');
const database = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'poc-mvp1-fj-grafica',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId ? database.findUserById(req.session.userId) : null;
  res.locals.flash = req.session.flash || null;
  req.session.flash = null;
  next();
});

app.use(routes);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`POC MVP1 FJ Grafica rodando em http://localhost:${port}`);
  });
}

module.exports = app;
