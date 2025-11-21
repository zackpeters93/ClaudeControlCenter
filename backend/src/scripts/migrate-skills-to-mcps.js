/**
 * Migration Script: Skills → MCPs
 *
 * Purpose: Move MCP server data from incorrectly named "skills" table to "mcps" table
 * This script transforms the data structure to match the new Mcp model
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateSkillsToMcps() {
  console.log('🔄 Starting migration: Skills → MCPs\n');

  try {
    // Step 1: Backup existing skills data
    console.log('📦 Step 1: Fetching existing "skills" data...');
    const existingSkills = await prisma.skill.findMany();
    console.log(`   Found ${existingSkills.length} records in skills table\n`);

    if (existingSkills.length === 0) {
      console.log('ℹ️  No skills to migrate. Exiting.');
      return;
    }

    // Step 2: Show data that will be migrated
    console.log('📋 Skills to be migrated as MCPs:');
    existingSkills.forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.name} (${skill.category})`);
    });
    console.log('');

    // Step 3: Transform and insert into mcps table
    console.log('🔄 Step 2: Transforming and inserting into mcps table...');

    let successCount = 0;
    let skipCount = 0;

    for (const skill of existingSkills) {
      try {
        // Check if MCP with same name already exists
        const existingMcp = await prisma.mcp.findFirst({
          where: { name: skill.name }
        });

        if (existingMcp) {
          console.log(`   ⚠️  Skipping "${skill.name}" - already exists in mcps table`);
          skipCount++;
          continue;
        }

        // Transform skills schema to mcps schema
        const mcpData = {
          name: skill.name,
          category: skill.category || 'uncategorized',
          description: skill.longDescription || skill.description || 'No description',
          icon: skill.icon || 'fa-plug',
          color: skill.color || '#0984e3',
          availability: skill.availability || ['desktop'],

          // Transform tools array to capabilities
          capabilities: Array.isArray(skill.tools) ? skill.tools : [],
          toolCount: Array.isArray(skill.tools) ? skill.tools.length : 0,

          // Create example configuration
          configuration: {
            command: skill.name.toLowerCase().replace(/\s+/g, '-'),
            args: [],
            env: {}
          },
          configExample: generateConfigExample(skill.name),

          documentation: skill.documentation || null,
          source: skill.source || 'manual',
          status: 'active',
          isFavorite: skill.isFavorite || false,
          usageCount: skill.usageCount || 0
        };

        // Insert into mcps table
        await prisma.mcp.create({ data: mcpData });
        console.log(`   ✅ Migrated: ${skill.name}`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Error migrating "${skill.name}":`, error.message);
      }
    }

    console.log('');
    console.log(`📊 Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ⚠️  Skipped (duplicates): ${skipCount}`);
    console.log(`   ❌ Failed: ${existingSkills.length - successCount - skipCount}`);
    console.log('');

    // Step 4: Clear skills table (now that MCPs are migrated)
    if (successCount > 0) {
      console.log('🧹 Step 3: Clearing skills table...');
      const deleted = await prisma.skill.deleteMany({});
      console.log(`   ✅ Deleted ${deleted.count} records from skills table`);
      console.log('   ℹ️  Skills table is now ready for Claude Skills (markdown-based)\n');
    }

    console.log('✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate example configuration for claude_desktop_config.json
 */
function generateConfigExample(mcpName) {
  const serverName = mcpName.toLowerCase().replace(/\s+/g, '-');

  return `{
  "mcpServers": {
    "${serverName}": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/${serverName}"]
    }
  }
}`;
}

// Run migration
migrateSkillsToMcps()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
