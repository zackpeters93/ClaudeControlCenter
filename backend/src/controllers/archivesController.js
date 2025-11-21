const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all archives
 */
exports.getAll = async (req, res) => {
  try {
    const archives = await prisma.archive.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ success: true, count: archives.length, data: archives });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get archive by ID
 */
exports.getById = async (req, res) => {
  try {
    const archive = await prisma.archive.findUnique({
      where: { id: req.params.id }
    });
    if (!archive) {
      return res.status(404).json({ success: false, error: 'Archive not found' });
    }
    res.json({ success: true, data: archive });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create new archive (snapshot)
 */
exports.create = async (req, res) => {
  try {
    const { version, data, note } = req.body;

    if (!data) {
      return res.status(400).json({ success: false, error: 'Configuration data is required' });
    }

    const archive = await prisma.archive.create({
      data: {
        version: version || '1.0.0',
        data: data,
        note: note || 'Auto-generated snapshot'
      }
    });

    // Keep only last 20 archives
    const count = await prisma.archive.count();
    if (count > 20) {
      const oldArchives = await prisma.archive.findMany({
        orderBy: { createdAt: 'asc' },
        take: count - 20,
        select: { id: true }
      });
      await prisma.archive.deleteMany({
        where: { id: { in: oldArchives.map(a => a.id) } }
      });
    }

    res.status(201).json({ success: true, data: archive });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Delete archive
 */
exports.delete = async (req, res) => {
  try {
    await prisma.archive.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Archive deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Archive not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get archive stats
 */
exports.getStats = async (req, res) => {
  try {
    const count = await prisma.archive.count();
    const latest = await prisma.archive.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, version: true }
    });

    // Calculate total storage size (approximate)
    const archives = await prisma.archive.findMany({
      select: { data: true }
    });
    const totalSize = archives.reduce((sum, a) => sum + JSON.stringify(a.data).length, 0);

    res.json({
      success: true,
      data: {
        totalSnapshots: count,
        currentVersion: latest?.version || '1.0.0',
        lastBackup: latest?.createdAt || null,
        totalSizeKB: (totalSize / 1024).toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
