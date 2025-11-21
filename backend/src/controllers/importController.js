const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const prisma = new PrismaClient();

exports.importJSON = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileContent = await fs.readFile(req.file.path, 'utf-8');
    const data = JSON.parse(fileContent);

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    // Process and import data
    const results = await processImportData(data, req.file.originalname);

    res.json({
      success: true,
      message: 'JSON import successful',
      data: results
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Process imported JSON data and insert into database
 */
async function processImportData(data, source = 'file') {
  const results = {
    skills: { imported: 0, skipped: 0 },
    agents: { imported: 0, skipped: 0 },
    mcps: { imported: 0, skipped: 0 },
    templates: { imported: 0, skipped: 0 },
    total: 0
  };

  // Import Skills
  if (data.skills && Array.isArray(data.skills)) {
    for (const skill of data.skills) {
      try {
        await prisma.skill.upsert({
          where: { id: skill.id || `import-${Date.now()}-${Math.random()}` },
          update: {
            name: skill.name,
            description: skill.description,
            category: skill.category || 'general',
            content: skill.content,
            examples: skill.examples || [],
            tags: skill.tags || [],
            isFavorite: skill.isFavorite || false
          },
          create: {
            name: skill.name,
            description: skill.description || '',
            category: skill.category || 'general',
            content: skill.content || '',
            examples: skill.examples || [],
            tags: skill.tags || [],
            isFavorite: skill.isFavorite || false
          }
        });
        results.skills.imported++;
      } catch (e) {
        results.skills.skipped++;
      }
    }
  }

  // Import Agents
  if (data.agents && Array.isArray(data.agents)) {
    for (const agent of data.agents) {
      try {
        await prisma.agent.upsert({
          where: { id: agent.id || `import-${Date.now()}-${Math.random()}` },
          update: {
            name: agent.name,
            description: agent.description,
            type: agent.type || 'custom',
            systemPrompt: agent.systemPrompt,
            tools: agent.tools || [],
            useCases: agent.useCases || [],
            decisionTree: agent.decisionTree,
            isFavorite: agent.isFavorite || false
          },
          create: {
            name: agent.name,
            description: agent.description || '',
            type: agent.type || 'custom',
            systemPrompt: agent.systemPrompt || '',
            tools: agent.tools || [],
            useCases: agent.useCases || [],
            decisionTree: agent.decisionTree || '',
            isFavorite: agent.isFavorite || false
          }
        });
        results.agents.imported++;
      } catch (e) {
        results.agents.skipped++;
      }
    }
  }

  // Import MCPs
  if (data.mcps && Array.isArray(data.mcps)) {
    for (const mcp of data.mcps) {
      try {
        await prisma.mCP.upsert({
          where: { id: mcp.id || `import-${Date.now()}-${Math.random()}` },
          update: {
            name: mcp.name,
            description: mcp.description,
            category: mcp.category || 'general',
            command: mcp.command,
            args: mcp.args || [],
            env: mcp.env || {},
            isActive: mcp.isActive !== false
          },
          create: {
            name: mcp.name,
            description: mcp.description || '',
            category: mcp.category || 'general',
            command: mcp.command || '',
            args: mcp.args || [],
            env: mcp.env || {},
            isActive: mcp.isActive !== false
          }
        });
        results.mcps.imported++;
      } catch (e) {
        results.mcps.skipped++;
      }
    }
  }

  // Import Templates
  if (data.templates && Array.isArray(data.templates)) {
    for (const template of data.templates) {
      try {
        await prisma.template.upsert({
          where: { id: template.id || `import-${Date.now()}-${Math.random()}` },
          update: {
            name: template.name,
            description: template.description,
            category: template.category || 'general',
            structure: template.structure || {},
            variables: template.variables || [],
            tags: template.tags || []
          },
          create: {
            name: template.name,
            description: template.description || '',
            category: template.category || 'general',
            structure: template.structure || {},
            variables: template.variables || [],
            tags: template.tags || []
          }
        });
        results.templates.imported++;
      } catch (e) {
        results.templates.skipped++;
      }
    }
  }

  // Calculate total
  results.total = results.skills.imported + results.agents.imported +
                  results.mcps.imported + results.templates.imported;

  // Record import history
  if (results.total > 0) {
    const types = [];
    if (results.skills.imported > 0) types.push('skill');
    if (results.agents.imported > 0) types.push('agent');
    if (results.mcps.imported > 0) types.push('mcp');
    if (results.templates.imported > 0) types.push('template');

    await prisma.importHistory.create({
      data: {
        type: types.join(','),
        source: source,
        itemCount: results.total,
        status: 'success',
        details: results
      }
    });
  }

  return results;
}

exports.importFromURL = async (req, res) => {
  // TODO: Implement URL import
  res.json({
    success: true,
    message: 'URL import not yet implemented',
    data: { imported: 0 }
  });
};

exports.importFromGitHub = async (req, res) => {
  // TODO: Implement GitHub import
  res.json({
    success: true,
    message: 'GitHub import not yet implemented',
    data: { imported: 0 }
  });
};

exports.bulkImport = async (req, res) => {
  // TODO: Implement bulk import
  res.json({
    success: true,
    message: 'Bulk import not yet implemented',
    data: { imported: 0 }
  });
};

exports.getHistory = async (req, res) => {
  try {
    const history = await prisma.importHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
