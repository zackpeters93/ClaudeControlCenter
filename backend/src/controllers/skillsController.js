const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all skills with optional filtering
exports.getAll = async (req, res) => {
  try {
    const { category, source, favorite, availability } = req.query;

    const where = {};
    if (category) where.category = category;
    if (source) where.source = source;
    if (favorite === 'true') where.isFavorite = true;
    if (availability) {
      where.availability = {
        path: '$',
        array_contains: availability
      };
    }

    const skills = await prisma.skill.findMany({
      where,
      orderBy: [
        { isFavorite: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const total = await prisma.skill.count();
    const favorites = await prisma.skill.count({ where: { isFavorite: true } });
    const byCategory = await prisma.skill.groupBy({
      by: ['category'],
      _count: true
    });
    const bySource = await prisma.skill.groupBy({
      by: ['source'],
      _count: true
    });

    res.json({
      success: true,
      data: {
        total,
        favorites,
        byCategory,
        bySource
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get skill by ID
exports.getById = async (req, res) => {
  try {
    const skill = await prisma.skill.findUnique({
      where: { id: req.params.id }
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found'
      });
    }

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new skill
exports.create = async (req, res) => {
  try {
    const skill = await prisma.skill.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      data: skill
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update skill
exports.update = async (req, res) => {
  try {
    const skill = await prisma.skill.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Skill not found'
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete skill
exports.delete = async (req, res) => {
  try {
    await prisma.skill.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Skill not found'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Search skills
exports.search = async (req, res) => {
  try {
    const { query, category, source } = req.body;

    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { documentation: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (category) where.category = category;
    if (source) where.source = source;

    const skills = await prisma.skill.findMany({
      where,
      orderBy: { usageCount: 'desc' }
    });

    res.json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Toggle favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const skill = await prisma.skill.findUnique({
      where: { id: req.params.id }
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found'
      });
    }

    const updated = await prisma.skill.update({
      where: { id: req.params.id },
      data: { isFavorite: !skill.isFavorite }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Increment usage count
exports.incrementUsage = async (req, res) => {
  try {
    const skill = await prisma.skill.update({
      where: { id: req.params.id },
      data: { usageCount: { increment: 1 } }
    });

    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Skill not found'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
