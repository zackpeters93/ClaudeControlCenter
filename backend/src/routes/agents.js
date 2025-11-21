const express = require('express');
const router = express.Router();
const agentsController = require('../controllers/agentsController');

router.get('/', agentsController.getAll);
router.get('/stats', agentsController.getStats);
router.get('/:id', agentsController.getById);
router.post('/', agentsController.create);
router.put('/:id', agentsController.update);
router.delete('/:id', agentsController.delete);
router.post('/search', agentsController.search);
router.patch('/:id/usage', agentsController.incrementUsage);

module.exports = router;
