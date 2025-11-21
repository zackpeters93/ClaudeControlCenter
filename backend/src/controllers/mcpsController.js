const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const mcps = await prisma.mcp.findMany({
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }]
    });
    res.json({ success: true, count: mcps.length, data: mcps });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await prisma.mcp.count();
    const active = await prisma.mcp.count({ where: { status: 'active' } });
    res.json({ success: true, data: { total, active } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const mcp = await prisma.mcp.findUnique({ where: { id: req.params.id } });
    if (!mcp) return res.status(404).json({ success: false, error: 'MCP not found' });
    res.json({ success: true, data: mcp });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const mcp = await prisma.mcp.create({ data: req.body });
    res.status(201).json({ success: true, data: mcp });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const mcp = await prisma.mcp.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: mcp });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'MCP not found' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await prisma.mcp.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'MCP deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'MCP not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { query } = req.body;
    const mcps = await prisma.mcp.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { usageCount: 'desc' }
    });
    res.json({ success: true, count: mcps.length, data: mcps });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const mcp = await prisma.mcp.findUnique({ where: { id: req.params.id } });
    if (!mcp) return res.status(404).json({ success: false, error: 'MCP not found' });

    const updated = await prisma.mcp.update({
      where: { id: req.params.id },
      data: { status: mcp.status === 'active' ? 'inactive' : 'active' }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.incrementUsage = async (req, res) => {
  try {
    const mcp = await prisma.mcp.update({
      where: { id: req.params.id },
      data: { usageCount: { increment: 1 } }
    });
    res.json({ success: true, data: mcp });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'MCP not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
