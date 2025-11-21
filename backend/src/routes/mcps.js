const express = require('express');
const router = express.Router();
const mcpsController = require('../controllers/mcpsController');

router.get('/', mcpsController.getAll);
router.get('/stats', mcpsController.getStats);
router.get('/:id', mcpsController.getById);
router.post('/', mcpsController.create);
router.put('/:id', mcpsController.update);
router.delete('/:id', mcpsController.delete);
router.post('/search', mcpsController.search);
router.patch('/:id/status', mcpsController.toggleStatus);
router.patch('/:id/usage', mcpsController.incrementUsage);

module.exports = router;
