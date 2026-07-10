const fs = require('fs');
const path = require('path');
const dataStore = require('../dataStore');

function download(req, res) {
  const documento = dataStore.findDocumentoById(req.params.id);

  if (!documento || !fs.existsSync(documento.caminho_arquivo)) {
    return res.redirect('/pedidos?error=Documento%20nao%20encontrado.');
  }

  return res.download(path.resolve(documento.caminho_arquivo), documento.nome_arquivo);
}

module.exports = {
  download
};
