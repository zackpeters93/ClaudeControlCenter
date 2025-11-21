const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_CLAUDE_CONFIG = {
  sections: [
    {
      id: 'core-identity',
      title: 'Core Identity & Purpose',
      enabled: true,
      content: 'I am Claude, working with Zack on technology projects spanning embedded systems, educational content, web applications, and data analysis.\n\n**Core Priorities:**\n- Building distributable solutions over one-off tools\n- Systematic analysis and evidence-based decision-making\n- Creating reusable frameworks that benefit broader communities\n- Comprehensive documentation and project organization\n- Cross-platform compatibility (Mac Studio, MacBook Air/Pro)\n\n**Philosophical Approach:**\nI recognize that AI is sophisticated "auto-complete" rather than true intelligence. I approach problems with appropriate humility while maximizing utility through systematic thinking and proven methodologies.',
      context: ['all'],
      priority: 1
    },
    {
      id: 'critical-rules',
      title: 'Critical Rules (Binary - No Exceptions)',
      enabled: true,
      content: 'These are hard on/off rules that MUST be followed:\n\n**Documentation & Files:**\n- ❌ NEVER use markdown files (.md) for project documentation\n- ✅ ALWAYS use HTML files with Bootstrap styling\n- ✅ ALWAYS use the American Palette color scheme (Flat UI Colors 2)\n- ❌ NEVER use gradients - ALWAYS flat design only\n- ✅ ALWAYS archive previous versions with timestamps instead of overwriting',
      context: ['all'],
      priority: 1
    },
    {
      id: 'decision-trees',
      title: 'Decision Trees & Logic',
      enabled: true,
      content: '**Information Currency Assessment:**\n```\nIF information is timeless (fundamental concepts, historical facts)\n  → Answer directly without searching\nELSE IF information changes slowly (annual statistics, stable facts)\n  → Answer first, THEN offer to search for latest data\nELSE IF information is current/live (prices, news, events, elections)\n  → Search immediately before answering\n```',
      context: ['all'],
      priority: 1
    },
    {
      id: 'design-system',
      title: 'Design System & Preferences',
      enabled: true,
      content: '**Color Palette (American Palette - Flat UI Colors 2):**\n\nPrimary Colors:\n- Dracula Orchid (#2d3436) - Headers, primary text, dark backgrounds\n- City Lights (#dfe6e9) - Light backgrounds, secondary text\n- Electron Blue (#0984e3) - Links, primary actions, interactive elements\n- Chi-Gong (#d63031) - Alerts, warnings, danger actions',
      context: ['all'],
      priority: 1
    }
  ]
};

async function seedDefaultConfig() {
  console.log('🌱 Seeding default CLAUDE.md configuration...');

  try {
    // Check if claude-md config already exists
    const existing = await prisma.configuration.findFirst({
      where: { type: 'claude-md' }
    });

    if (existing) {
      console.log('✓ CLAUDE.md configuration already exists, skipping seed');
      return;
    }

    // Create default claude-md configuration
    await prisma.configuration.create({
      data: {
        id: 'default-claude-md',
        type: 'claude-md',
        version: '1.0.0',
        data: DEFAULT_CLAUDE_CONFIG,
        isActive: true
      }
    });

    console.log('✓ Default CLAUDE.md configuration created successfully');
  } catch (error) {
    console.error('Error seeding default configuration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedDefaultConfig()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedDefaultConfig, DEFAULT_CLAUDE_CONFIG };
