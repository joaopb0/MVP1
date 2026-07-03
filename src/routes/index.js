const express = require('express');
const multer = require('multer');
const path = require('path');
const AuthController = require('../controllers/AuthController');
const DashboardController = require('../controllers/DashboardController');
const PedidoController = require('../controllers/PedidoController');
const LancamentoController = require('../controllers/LancamentoController');
const UploadController = require('../controllers/UploadController');
const { ensureAuthenticated, requireFuncao } = require('../middleware/auth');

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'storage', 'uploads'),
    filename: (_req, file, done) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      done(null, `${Date.now()}-${safeName}`);
    }
  })
});

router.get('/login', AuthController.loginView);
router.post('/login', AuthController.authenticate);
router.get('/logout', ensureAuthenticated, AuthController.logout);

router.get('/', ensureAuthenticated, DashboardController.index);

router.get('/pedidos', ensureAuthenticated, PedidoController.index);
router.post('/pedidos', ensureAuthenticated, PedidoController.store);
router.put('/pedidos/:id', ensureAuthenticated, PedidoController.update);
router.delete('/pedidos/:id', ensureAuthenticated, requireFuncao('Gestor'), PedidoController.destroy);

router.post('/upload', ensureAuthenticated, upload.single('documento'), UploadController.store);
router.get('/documentos/:id/download', ensureAuthenticated, UploadController.download);

router.get('/lancamentos', ensureAuthenticated, requireFuncao('Gestor'), LancamentoController.index);
router.post('/lancamentos', ensureAuthenticated, requireFuncao('Gestor'), LancamentoController.store);

module.exports = router;
