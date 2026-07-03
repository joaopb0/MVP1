const express = require('express');
const multer = require('multer');
const path = require('path');
const PedidoController = require('../controllers/PedidoController');

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'storage', 'uploads'),
    filename: (_req, file, done) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      done(null, `${Date.now()}-${safeName}`);
    }
  })
});

router.get('/', PedidoController.index);
router.get('/novo', PedidoController.novo);
router.post('/novo', upload.single('documento'), PedidoController.store);
router.get('/:id', PedidoController.show);
router.post('/:id/documentos', upload.single('documento'), PedidoController.storeDocumento);

module.exports = router;
