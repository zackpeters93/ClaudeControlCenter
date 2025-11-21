const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skillsController');

// GET /api/skills - Get all skills (with optional filtering)
router.get('/', skillsController.getAll);

// GET /api/skills/stats - Get statistics
router.get('/stats', skillsController.getStats);

// GET /api/skills/:id - Get single skill by ID
router.get('/:id', skillsController.getById);

// POST /api/skills - Create new skill
router.post('/', skillsController.create);

// PUT /api/skills/:id - Update skill
router.put('/:id', skillsController.update);

// DELETE /api/skills/:id - Delete skill
router.delete('/:id', skillsController.delete);

// POST /api/skills/search - Search skills
router.post('/search', skillsController.search);

// PATCH /api/skills/:id/favorite - Toggle favorite
router.patch('/:id/favorite', skillsController.toggleFavorite);

// PATCH /api/skills/:id/usage - Increment usage count
router.patch('/:id/usage', skillsController.incrementUsage);

module.exports = router;
