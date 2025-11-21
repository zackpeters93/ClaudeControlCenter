const express = require('express');
const router = express.Router();
const templatesController = require('../controllers/templatesController');

router.get('/', templatesController.getAll);
router.get('/stats', templatesController.getStats);
router.get('/:id', templatesController.getById);
router.post('/', templatesController.create);
router.put('/:id', templatesController.update);
router.delete('/:id', templatesController.delete);
router.post('/search', templatesController.search);
router.get('/:id/export', templatesController.export);
router.patch('/:id/usage', templatesController.incrementUsage);

module.exports = router;
