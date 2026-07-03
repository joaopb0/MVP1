const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`SGI FJ Grafica MVP rodando em http://localhost:${port}`);
});
