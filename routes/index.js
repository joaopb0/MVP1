const express = require('express');
const DashboardController = require('../controllers/DashboardController');
const DocumentoController = require('../controllers/DocumentoController');
const PocController = require('../controllers/PocController');
const pedidosRoutes = require('./pedidos');

const router = express.Router();

router.get('/', (_req, res) => res.redirect('/dashboard'));
router.get('/dashboard', DashboardController.index);
router.get('/poc-mvp1', PocController.index);
router.get('/documentos/:id/download', DocumentoController.download);
router.use('/pedidos', pedidosRoutes);

module.exports = router;
