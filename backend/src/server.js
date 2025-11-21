const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import routes
const skillsRoutes = require('./routes/skills');
const agentsRoutes = require('./routes/agents');
const mcpsRoutes = require('./routes/mcps');
const templatesRoutes = require('./routes/templates');
const configurationsRoutes = require('./routes/configurations');
const searchRoutes = require('./routes/search');
const importRoutes = require('./routes/import');
const archivesRoutes = require('./routes/archives');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or file://)
    // Allow localhost:8080 (Docker frontend)
    // Allow null (direct file access)
    const allowedOrigins = [
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      null,
      undefined
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API routes
app.use('/api/skills', skillsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/mcps', mcpsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/configurations', configurationsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/import', importRoutes);
app.use('/api/archives', archivesRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Claude Commander API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      skills: '/api/skills',
      agents: '/api/agents',
      mcps: '/api/mcps',
      templates: '/api/templates',
      configurations: '/api/configurations',
      search: '/api/search',
      import: '/api/import',
      archives: '/api/archives'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Claude Control Center API Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ API available at http://localhost:${PORT}/api`);
  console.log(`✓ Health check at http://localhost:${PORT}/api/health`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

module.exports = app;
