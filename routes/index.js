const express = require('express');
const AuthController = require('../controllers/AuthController');
const DashboardController = require('../controllers/DashboardController');
const DocumentoController = require('../controllers/DocumentoController');
const PocController = require('../controllers/PocController');
const pedidosRoutes = require('./pedidos');
const { ensureAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/login', AuthController.loginView);
router.post('/login', AuthController.authenticate);
router.get('/logout', ensureAuthenticated, AuthController.logout);

router.use(ensureAuthenticated);

router.get('/', (_req, res) => res.redirect('/dashboard'));
router.get('/dashboard', DashboardController.index);
router.get('/poc-mvp1', PocController.index);
router.get('/documentos/:id/download', DocumentoController.download);
router.use('/pedidos', pedidosRoutes);

module.exports = router;
