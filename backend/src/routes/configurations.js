const express = require('express');
const router = express.Router();
const configurationsController = require('../controllers/configurationsController');

router.get('/', configurationsController.getAll);
router.get('/:id', configurationsController.getById);
router.post('/', configurationsController.create);
router.put('/:id', configurationsController.update);
router.delete('/:id', configurationsController.delete);
router.get('/:id/export', configurationsController.exportConfig);
router.post('/:id/snapshot', configurationsController.createSnapshot);
router.get('/:id/snapshots', configurationsController.getSnapshots);
router.post('/snapshots/:snapshotId/restore', configurationsController.restoreSnapshot);

module.exports = router;
