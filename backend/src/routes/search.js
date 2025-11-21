const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.post('/local', searchController.searchLocal);
router.post('/external', searchController.searchExternal);
router.post('/anthropic', searchController.searchAnthropic);

module.exports = router;
