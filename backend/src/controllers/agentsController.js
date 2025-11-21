const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all agents
exports.getAll = async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    res.json({ success: true, count: agents.length, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const total = await prisma.agent.count();
    const byType = await prisma.agent.groupBy({
      by: ['type'],
      _count: true
    });
    res.json({ success: true, data: { total, byType } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get agent by ID
exports.getById = async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id }
    });
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create agent
exports.create = async (req, res) => {
  try {
    const agent = await prisma.agent.create({
      data: req.body
    });
    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update agent
exports.update = async (req, res) => {
  try {
    const agent = await prisma.agent.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: agent });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete agent
exports.delete = async (req, res) => {
  try {
    await prisma.agent.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Search agents
exports.search = async (req, res) => {
  try {
    const { query, type } = req.body;
    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };
    if (type) where.type = type;

    const agents = await prisma.agent.findMany({
      where,
      orderBy: { usageCount: 'desc' }
    });
    res.json({ success: true, count: agents.length, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Increment usage
exports.incrementUsage = async (req, res) => {
  try {
    const agent = await prisma.agent.update({
      where: { id: req.params.id },
      data: { usageCount: { increment: 1 } }
    });
    res.json({ success: true, data: agent });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
