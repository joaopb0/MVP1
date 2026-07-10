const express = require('express');
const path = require('path');
const routes = require('./routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.flash = req.query.success
    ? { type: 'success', message: req.query.success }
    : req.query.error
      ? { type: 'danger', message: req.query.error }
      : null;
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
