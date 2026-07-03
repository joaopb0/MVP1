const fs = require('fs');
const path = require('path');
const database = require('../db');

function download(req, res) {
  const documento = database.findDocumentoById(req.params.id);

  if (!documento || !fs.existsSync(documento.caminho_arquivo)) {
    req.session.flash = {
      type: 'danger',
      message: 'Documento nao encontrado.'
    };
    return res.redirect('/pedidos');
  }

  return res.download(path.resolve(documento.caminho_arquivo), documento.nome_arquivo);
}

module.exports = {
  download
};
