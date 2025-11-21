/**
 * MCP Seeder - Populate MCP servers properly
 * Run: docker exec claude-backend node src/scripts/seed-mcps.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// MCP Server Data (NOT Skills!)
const MCP_SERVERS = [
  {
    name: 'Desktop Commander',
    category: 'File Management',
    description: 'Comprehensive file operations, terminal access, and process management for local system interaction. Essential for file analysis, data processing, and system automation.',
    icon: 'fa-terminal',
    color: '#d63031',
    availability: ['desktop', 'code'],
    configuration: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/desktop-commander']
    },
    configExample: `{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/desktop-commander"]
    }
  }
}`,
    capabilities: [
      { name: 'read_file', description: 'Read file contents with offset/limit support' },
      { name: 'write_file', description: 'Write or append to files (use chunking for large files)' },
      { name: 'create_directory', description: 'Create directories' },
      { name: 'list_directory', description: 'List directory contents with depth control' },
      { name: 'move_file', description: 'Move or rename files' },
      { name: 'get_file_info', description: 'Get file metadata' },
      { name: 'edit_block', description: 'Surgical text replacements' },
      { name: 'start_search', description: 'Streaming file/content search' },
      { name: 'start_process', description: 'Start terminal processes with smart detection' },
      { name: 'interact_with_process', description: 'Send input to running processes' },
      { name: 'read_process_output', description: 'Read process output with smart detection' }
    ],
    documentation: 'https://github.com/QuantGeekDev/desktop-commander',
    source: 'anthropic'
  },
  {
    name: 'Sequential-Thinking',
    category: 'Planning',
    description: 'Dynamic problem-solving through flexible, adaptive thinking process. Essential for planning, architecture decisions, and multi-step solutions with branching and revision support.',
    icon: 'fa-brain',
    color: '#0984e3',
    availability: ['desktop', 'code', 'web'],
    configuration: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/sequential-thinking']
    },
    configExample: `{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/sequential-thinking"]
    }
  }
}`,
    capabilities: [
      { name: 'sequentialthinking', description: 'Execute thinking process with branching and revision support' }
    ],
    documentation: 'https://github.com/sequentialthinking/mcp',
    source: 'community'
  },
  {
    name: 'GitHub',
    category: 'Version Control',
    description: 'Complete GitHub integration for repositories, PRs, issues, and code management. Full GitHub API access for managing repositories, creating PRs, handling issues, searching code, and managing branches.',
    icon: 'fa-brands fa-github',
    color: '#2d3436',
    availability: ['desktop', 'code', 'web'],
    configuration: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: '<your-token>'
      }
    },
    configExample: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}`,
    capabilities: [
      { name: 'create_or_update_file', description: 'Create or update repository files' },
      { name: 'search_repositories', description: 'Search GitHub repositories' },
      { name: 'create_repository', description: 'Create new repositories' },
      { name: 'get_file_contents', description: 'Get file/directory contents' },
      { name: 'push_files', description: 'Push multiple files in one commit' },
      { name: 'create_issue', description: 'Create repository issues' },
      { name: 'create_pull_request', description: 'Create pull requests' },
      { name: 'fork_repository', description: 'Fork repositories' },
      { name: 'create_branch', description: 'Create new branches' },
      { name: 'list_commits', description: 'List branch commits' },
      { name: 'get_pull_request', description: 'Get PR details' },
      { name: 'merge_pull_request', description: 'Merge pull requests' }
    ],
    documentation: 'https://docs.github.com/en/rest',
    githubUrl: 'https://github.com/modelcontextprotocol/server-github',
    source: 'anthropic'
  },
  {
    name: 'Memory',
    category: 'Context & Memory',
    description: 'Knowledge graph for persistent context and relationship management. Provides a knowledge graph system for storing entities, observations, and relationships across sessions.',
    icon: 'fa-database',
    color: '#00b894',
    availability: ['desktop', 'code', 'web'],
    configuration: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory']
    },
    configExample: `{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}`,
    capabilities: [
      { name: 'create_entities', description: 'Create new entities in knowledge graph' },
      { name: 'create_relations', description: 'Create relations between entities' },
      { name: 'add_observations', description: 'Add observations to entities' },
      { name: 'delete_entities', description: 'Delete entities and relations' },
      { name: 'delete_observations', description: 'Delete specific observations' },
      { name: 'delete_relations', description: 'Delete relations' },
      { name: 'read_graph', description: 'Read entire knowledge graph' },
      { name: 'search_nodes', description: 'Search nodes by query' },
      { name: 'open_nodes', description: 'Open specific nodes by name' }
    ],
    documentation: 'https://github.com/anthropics/mcp-memory',
    githubUrl: 'https://github.com/anthropics/mcp-memory',
    source: 'anthropic'
  },
  {
    name: 'Fetch',
    category: 'Web Operations',
    description: 'Fetch and process web content with markdown conversion. Retrieves web content and converts HTML to markdown for easy processing with intelligent redirect handling.',
    icon: 'fa-globe',
    color: '#0984e3',
    availability: ['desktop', 'code', 'web'],
    configuration: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-fetch']
    },
    configExample: `{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}`,
    capabilities: [
      { name: 'fetch', description: 'Fetch URL content and convert to markdown' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/mcp-fetch',
    githubUrl: 'https://github.com/modelcontextprotocol/mcp-fetch',
    source: 'anthropic'
  },
  {
    name: 'Puppeteer',
    category: 'Web Automation',
    description: 'Browser automation for web interaction and testing. Provides headless browser automation for navigating websites, taking screenshots, interacting with elements, and executing JavaScript.',
    icon: 'fa-robot',
    color: '#fdcb6e',
    availability: ['desktop', 'code'],
    configuration: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer']
    },
    configExample: `{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}`,
    capabilities: [
      { name: 'navigate', description: 'Navigate to URL' },
      { name: 'screenshot', description: 'Take page or element screenshots' },
      { name: 'click', description: 'Click page elements' },
      { name: 'fill', description: 'Fill input fields' },
      { name: 'select', description: 'Select dropdown options' },
      { name: 'hover', description: 'Hover over elements' },
      { name: 'evaluate', description: 'Execute JavaScript in browser' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/mcp-puppeteer',
    githubUrl: 'https://github.com/modelcontextprotocol/mcp-puppeteer',
    source: 'anthropic'
  },
  {
    name: 'Figma',
    category: 'Design Tools',
    description: 'Figma integration for design file access and collaboration. Provides access to Figma design files, nodes, comments, and collaboration features for design review and documentation workflows.',
    icon: 'fa-figma',
    color: '#d63031',
    availability: ['desktop', 'code', 'web'],
    configuration: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-figma'],
      env: {
        FIGMA_PERSONAL_ACCESS_TOKEN: '<your-token>'
      }
    },
    configExample: `{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    }
  }
}`,
    capabilities: [
      { name: 'add_figma_file', description: 'Add Figma file to context' },
      { name: 'view_node', description: 'Get thumbnail for specific node' },
      { name: 'read_comments', description: 'Read all comments on file' },
      { name: 'post_comment', description: 'Post comment on node' },
      { name: 'reply_to_comment', description: 'Reply to existing comment' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/mcp-figma',
    githubUrl: 'https://github.com/modelcontextprotocol/mcp-figma',
    source: 'anthropic'
  }
];

async function seedMcps() {
  console.log('🌱 Starting MCP seeding...\n');

  try {
    // Clear existing MCPs
    console.log('🧹 Clearing existing MCPs...');
    await prisma.mcp.deleteMany();
    console.log('   ✅ Cleared\n');

    // Seed MCPs
    console.log(`📦 Seeding ${MCP_SERVERS.length} MCP servers...\n`);

    for (const mcp of MCP_SERVERS) {
      const toolCount = mcp.capabilities.length;
      await prisma.mcp.create({
        data: {
          ...mcp,
          toolCount,
          status: 'active',
          isFavorite: false,
          usageCount: 0
        }
      });
      console.log(`   ✅ ${mcp.name} (${toolCount} tools)`);
    }

    console.log(`\n✅ Successfully seeded ${MCP_SERVERS.length} MCP servers!\n`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder
seedMcps()
  .then(() => {
    console.log('🎉 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
