const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }]
    });
    res.json({ success: true, count: templates.length, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await prisma.template.count();
    const byCategory = await prisma.template.groupBy({
      by: ['category'],
      _count: true
    });
    res.json({ success: true, data: { total, byCategory } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const template = await prisma.template.findUnique({ where: { id: req.params.id } });
    if (!template) return res.status(404).json({ success: false, error: 'Template not found' });
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const template = await prisma.template.create({ data: req.body });
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const template = await prisma.template.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: template });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await prisma.template.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { query } = req.body;
    const templates = await prisma.template.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { usageCount: 'desc' }
    });
    res.json({ success: true, count: templates.length, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.export = async (req, res) => {
  try {
    const template = await prisma.template.findUnique({ where: { id: req.params.id } });
    if (!template) return res.status(404).json({ success: false, error: 'Template not found' });

    // Increment usage
    await prisma.template.update({
      where: { id: req.params.id },
      data: { usageCount: { increment: 1 } }
    });

    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.incrementUsage = async (req, res) => {
  try {
    const template = await prisma.template.update({
      where: { id: req.params.id },
      data: { usageCount: { increment: 1 } }
    });
    res.json({ success: true, data: template });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
