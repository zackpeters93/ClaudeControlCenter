const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../controllers/importController');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

router.post('/json', upload.single('file'), importController.importJSON);
router.post('/url', importController.importFromURL);
router.post('/github', importController.importFromGitHub);
router.post('/bulk', upload.single('file'), importController.bulkImport);
router.get('/history', importController.getHistory);

module.exports = router;
