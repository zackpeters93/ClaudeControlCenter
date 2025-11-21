/**
 * Import Anthropic Skills from GitHub Repository
 * Repository: https://github.com/anthropics/skills
 *
 * This script:
 * 1. Reads all SKILL.md files from the cloned repository
 * 2. Parses YAML frontmatter for metadata
 * 3. Extracts markdown content
 * 4. Creates skills in database with proper categorization
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Skill metadata mapping with categories, icons, and colors
const SKILL_METADATA = {
  'web-artifacts-builder': {
    category: 'coding',
    tags: ['react', 'web', 'artifacts', 'frontend', 'typescript', 'tailwind'],
    icon: 'fa-code',
    color: '#0984e3',
    whenToUse: 'Use when building complex, multi-component web artifacts with React, TypeScript, and shadcn/ui'
  },
  'frontend-design': {
    category: 'coding',
    tags: ['design', 'frontend', 'ui', 'web'],
    icon: 'fa-paint-brush',
    color: '#6c5ce7',
    whenToUse: 'Use when designing and implementing frontend user interfaces'
  },
  'canvas-design': {
    category: 'writing',
    tags: ['design', 'canvas', 'collaboration'],
    icon: 'fa-pen-fancy',
    color: '#e17055',
    whenToUse: 'Use when designing content or collaborating on canvas documents'
  },
  'theme-factory': {
    category: 'coding',
    tags: ['theming', 'design-system', 'css', 'colors'],
    icon: 'fa-palette',
    color: '#fdcb6e',
    whenToUse: 'Use when creating or customizing design system themes'
  },
  'algorithmic-art': {
    category: 'coding',
    tags: ['art', 'algorithms', 'creative-coding', 'svg'],
    icon: 'fa-shapes',
    color: '#fd79a8',
    whenToUse: 'Use when creating algorithmic or generative art'
  },
  'skill-creator': {
    category: 'documentation',
    tags: ['meta', 'skills', 'creation'],
    icon: 'fa-wand-magic-sparkles',
    color: '#a29bfe',
    whenToUse: 'Use when creating new Claude Skills'
  },
  'internal-comms': {
    category: 'writing',
    tags: ['communication', 'slack', 'internal'],
    icon: 'fa-comments',
    color: '#00b894',
    whenToUse: 'Use when drafting internal communications'
  },
  'brand-guidelines': {
    category: 'writing',
    tags: ['branding', 'guidelines', 'design'],
    icon: 'fa-book-open',
    color: '#e74c3c',
    whenToUse: 'Use when creating or applying brand guidelines'
  },
  'mcp-builder': {
    category: 'coding',
    tags: ['mcp', 'tools', 'integrations', 'development'],
    icon: 'fa-plug',
    color: '#2d3436',
    whenToUse: 'Use when building Model Context Protocol (MCP) servers'
  },
  'slack-gif-creator': {
    category: 'coding',
    tags: ['slack', 'gif', 'animations'],
    icon: 'fa-film',
    color: '#e17055',
    whenToUse: 'Use when creating animated GIFs for Slack'
  },
  'webapp-testing': {
    category: 'testing',
    tags: ['testing', 'qa', 'web', 'automation'],
    icon: 'fa-vial',
    color: '#0984e3',
    whenToUse: 'Use when testing web applications'
  },
  'pdf': {
    category: 'documentation',
    tags: ['pdf', 'documents', 'export'],
    icon: 'fa-file-pdf',
    color: '#d63031',
    whenToUse: 'Use when working with PDF documents'
  },
  'docx': {
    category: 'documentation',
    tags: ['word', 'documents', 'export'],
    icon: 'fa-file-word',
    color: '#0984e3',
    whenToUse: 'Use when working with Word documents'
  },
  'xlsx': {
    category: 'documentation',
    tags: ['excel', 'spreadsheets', 'data'],
    icon: 'fa-file-excel',
    color: '#00b894',
    whenToUse: 'Use when working with Excel spreadsheets'
  },
  'pptx': {
    category: 'documentation',
    tags: ['powerpoint', 'presentations', 'slides'],
    icon: 'fa-file-powerpoint',
    color: '#e74c3c',
    whenToUse: 'Use when creating PowerPoint presentations'
  }
};

/**
 * Parse YAML frontmatter from markdown file
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, content: content };
  }

  const [, frontmatterText, markdownContent] = match;

  // Parse YAML frontmatter (simple parser for key: value pairs)
  const metadata = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      metadata[key] = value;
    }
  });

  return { metadata, content: markdownContent };
}

/**
 * Generate slug from skill name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Find all SKILL.md files recursively
 */
function findSkillFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findSkillFiles(filePath, fileList);
    } else if (file === 'SKILL.md') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Import all skills from Anthropic repository
 */
async function importAnthropicSkills(repoPath) {
  console.log('🔍 Searching for SKILL.md files...');

  const skillFiles = findSkillFiles(repoPath);
  console.log(`📦 Found ${skillFiles.length} skill files`);

  console.log('\n🗑️  Clearing existing Anthropic skills...');
  await prisma.skill.deleteMany({
    where: { source: 'anthropic' }
  });

  let imported = 0;
  let skipped = 0;

  console.log('\n📥 Importing skills...\n');

  for (const filePath of skillFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { metadata, content } = parseFrontmatter(fileContent);

      // Extract skill name from metadata or directory name
      let skillName = metadata.name;
      if (!skillName) {
        // Use parent directory name as skill name
        const parentDir = path.basename(path.dirname(filePath));
        skillName = parentDir;
      }

      const slug = generateSlug(skillName);

      // Get enriched metadata
      const enrichedMetadata = SKILL_METADATA[slug] || {
        category: 'other',
        tags: [],
        icon: 'fa-file-alt',
        color: '#74b9ff',
        whenToUse: null
      };

      const description = metadata.description ||
        content.split('\n').find(line => line.trim() && !line.startsWith('#'))?.trim() ||
        `Anthropic Skill: ${skillName}`;

      // Prepare skill data
      const skillData = {
        name: skillName.split('-').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        slug: slug,
        description: description.substring(0, 500),
        content: content.trim(),
        category: enrichedMetadata.category,
        tags: enrichedMetadata.tags,
        source: 'anthropic',
        sourceUrl: `https://github.com/anthropics/skills/tree/main/${path.relative(repoPath, path.dirname(filePath))}`,
        whenToUse: enrichedMetadata.whenToUse,
        icon: enrichedMetadata.icon,
        color: enrichedMetadata.color,
        isFavorite: false,
        usageCount: 0
      };

      // Create skill in database
      await prisma.skill.create({
        data: skillData
      });

      console.log(`✅ Imported: ${skillData.name} (${skillData.category})`);
      imported++;

    } catch (error) {
      console.error(`❌ Error importing ${filePath}:`, error.message);
      skipped++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 Import Summary');
  console.log('='.repeat(80));
  console.log(`✅ Successfully imported: ${imported} skills`);
  console.log(`❌ Skipped: ${skipped} skills`);
  console.log(`📦 Total files processed: ${skillFiles.length}`);

  // Show category breakdown
  const skills = await prisma.skill.findMany({
    where: { source: 'anthropic' }
  });

  const categoryCount = {};
  skills.forEach(skill => {
    categoryCount[skill.category] = (categoryCount[skill.category] || 0) + 1;
  });

  console.log('\n📂 Category Breakdown:');
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`   ${category}: ${count} skills`);
    });

  console.log('\n✨ Import complete!\n');
}

// Main execution
async function main() {
  const repoPath = process.argv[2] || '/tmp/anthropic-skills';

  if (!fs.existsSync(repoPath)) {
    console.error(`❌ Repository path not found: ${repoPath}`);
    console.error('Please clone the repository first:');
    console.error('  git clone https://github.com/anthropics/skills /tmp/anthropic-skills');
    process.exit(1);
  }

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Anthropic Skills Import Script                         ║');
  console.log('║   Repository: https://github.com/anthropics/skills       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  await importAnthropicSkills(repoPath);

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
