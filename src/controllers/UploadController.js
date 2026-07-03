const fs = require('fs');
const path = require('path');
const database = require('../models/database');

function store(req, res) {
  if (!req.file) {
    req.session.flash = {
      type: 'danger',
      message: 'Selecione um arquivo para upload.'
    };
    return res.redirect('/pedidos');
  }

  try {
    database.createDocumento({
      tipo_documento: req.body.tipo_documento,
      nome_arquivo: req.file.originalname,
      caminho_arquivo: req.file.path,
      pedido_id: req.body.pedido_id,
      lancamento_manual_id: req.body.lancamento_manual_id
    });

    req.session.flash = {
      type: 'success',
      message: 'Documento armazenado e conciliado.'
    };
  } catch (error) {
    fs.unlink(req.file.path, () => {});
    req.session.flash = {
      type: 'danger',
      message: error.message
    };
  }

  return res.redirect('/pedidos');
}

function download(req, res) {
  const documento = database.findDocumentoById(req.params.id);

  if (!documento) {
    req.session.flash = {
      type: 'danger',
      message: 'Documento nao encontrado.'
    };
    return res.redirect('/pedidos');
  }

  return res.download(path.resolve(documento.caminho_arquivo), documento.nome_arquivo);
}

module.exports = {
  download,
  store
};
