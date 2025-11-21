const express = require('express');
const router = express.Router();
const archivesController = require('../controllers/archivesController');

// GET /api/archives - Get all archives
router.get('/', archivesController.getAll);

// GET /api/archives/stats - Get archive stats
router.get('/stats', archivesController.getStats);

// GET /api/archives/:id - Get archive by ID
router.get('/:id', archivesController.getById);

// POST /api/archives - Create new archive
router.post('/', archivesController.create);

// DELETE /api/archives/:id - Delete archive
router.delete('/:id', archivesController.delete);

module.exports = router;
