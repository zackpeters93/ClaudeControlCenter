const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.searchLocal = async (req, res) => {
  try {
    const { query, type } = req.body;
    let results = {};

    if (!type || type === 'skills') {
      results.skills = await prisma.skill.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      });
    }

    if (!type || type === 'agents') {
      results.agents = await prisma.agent.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      });
    }

    if (!type || type === 'mcps') {
      results.mcps = await prisma.mcp.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      });
    }

    if (!type || type === 'templates') {
      results.templates = await prisma.template.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      });
    }

    res.json({ success: true, query, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchExternal = async (req, res) => {
  // TODO: Implement external web search
  res.json({
    success: true,
    message: 'External search not yet implemented',
    data: []
  });
};

exports.searchAnthropic = async (req, res) => {
  // TODO: Implement Anthropic docs search
  res.json({
    success: true,
    message: 'Anthropic search not yet implemented',
    data: []
  });
};
