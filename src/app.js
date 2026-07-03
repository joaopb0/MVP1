const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');
const database = require('./models/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, _res, next) => {
  if (req.method === 'POST' && req.query._method) {
    req.method = req.query._method.toUpperCase();
  }
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sgi-fj-grafica-poc-academica',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

app.use('/bootstrap', express.static(path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use((req, res, next) => {
  const currentUser = req.session.userId ? database.findUserById(req.session.userId) : null;
  res.locals.currentUser = currentUser;
  res.locals.flash = req.session.flash || null;
  req.session.flash = null;
  next();
});

app.use(routes);

module.exports = app;
