/**
 * Import MCPs from user's GitHub repo
 * Run: docker exec claude-backend node src/scripts/import-mcps-from-repo.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// MCP Metadata enrichment - maps MCP names to full metadata
const MCP_METADATA = {
  'desktop-commander': {
    category: 'File Management',
    description: 'Comprehensive file operations, terminal access, and process management for local system interaction. Essential for file analysis, data processing, and system automation.',
    icon: 'fa-terminal',
    color: '#d63031',
    availability: ['desktop', 'code'],
    capabilities: [
      { name: 'read_file', description: 'Read file contents with offset/limit support' },
      { name: 'write_file', description: 'Write or append to files' },
      { name: 'create_directory', description: 'Create directories' },
      { name: 'list_directory', description: 'List directory contents' },
      { name: 'move_file', description: 'Move or rename files' },
      { name: 'get_file_info', description: 'Get file metadata' },
      { name: 'edit_block', description: 'Surgical text replacements' },
      { name: 'start_search', description: 'Streaming file/content search' },
      { name: 'start_process', description: 'Start terminal processes' },
      { name: 'interact_with_process', description: 'Send input to processes' },
      { name: 'read_process_output', description: 'Read process output' }
    ],
    documentation: 'https://github.com/QuantGeekDev/desktop-commander',
    source: 'anthropic'
  },
  'github': {
    category: 'Version Control',
    description: 'Complete GitHub integration for repositories, PRs, issues, and code management. Full GitHub API access for managing repositories, creating PRs, handling issues, searching code, and managing branches.',
    icon: 'fa-brands fa-github',
    color: '#2d3436',
    availability: ['desktop', 'code', 'web'],
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
  'sequential-thinking': {
    category: 'Planning',
    description: 'Dynamic problem-solving through flexible, adaptive thinking process. Essential for planning, architecture decisions, and multi-step solutions with branching and revision support.',
    icon: 'fa-brain',
    color: '#0984e3',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'sequentialthinking', description: 'Execute thinking process with branching and revision support' }
    ],
    documentation: 'https://github.com/sequentialthinking/mcp',
    source: 'community'
  },
  'memory': {
    category: 'Context & Memory',
    description: 'Knowledge graph for persistent context and relationship management. Provides a knowledge graph system for storing entities, observations, and relationships across sessions.',
    icon: 'fa-database',
    color: '#00b894',
    availability: ['desktop', 'code', 'web'],
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
  'fetch': {
    category: 'Web Operations',
    description: 'Fetch and process web content with markdown conversion. Retrieves web content and converts HTML to markdown for easy processing.',
    icon: 'fa-globe',
    color: '#0984e3',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'fetch', description: 'Fetch URL content and convert to markdown' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/mcp-fetch',
    githubUrl: 'https://github.com/modelcontextprotocol/mcp-fetch',
    source: 'anthropic'
  },
  'puppeteer': {
    category: 'Web Automation',
    description: 'Browser automation for web interaction and testing. Provides headless browser automation for navigating websites, taking screenshots, and interacting with elements.',
    icon: 'fa-robot',
    color: '#fdcb6e',
    availability: ['desktop', 'code'],
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
  'figma': {
    category: 'Design Tools',
    description: 'Figma integration for design file access and collaboration. Access design files, nodes, comments, and collaboration features.',
    icon: 'fa-figma',
    color: '#d63031',
    availability: ['desktop', 'code', 'web'],
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
  },
  'context7': {
    category: 'Context & Memory',
    description: 'Semantic search and context management powered by Upstash. Provides intelligent context retrieval and semantic search capabilities.',
    icon: 'fa-search',
    color: '#6c5ce7',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'semantic_search', description: 'Perform semantic searches across context' },
      { name: 'store_context', description: 'Store context for later retrieval' }
    ],
    documentation: 'https://github.com/upstash/context7-mcp',
    source: 'community'
  },
  'supabase': {
    category: 'Database',
    description: 'Supabase backend integration for database operations, auth, and storage. Manage PostgreSQL databases, authentication, and file storage.',
    icon: 'fa-database',
    color: '#3ECF8E',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'query_database', description: 'Execute SQL queries' },
      { name: 'manage_auth', description: 'Handle authentication' },
      { name: 'storage_operations', description: 'Manage file storage' }
    ],
    documentation: 'https://github.com/supabase/mcp-server-supabase',
    source: 'community'
  },
  'docker': {
    category: 'DevOps',
    description: 'Docker container management and operations. Control Docker containers, images, networks, and volumes.',
    icon: 'fa-brands fa-docker',
    color: '#2496ED',
    availability: ['desktop', 'code'],
    capabilities: [
      { name: 'list_containers', description: 'List Docker containers' },
      { name: 'start_container', description: 'Start containers' },
      { name: 'stop_container', description: 'Stop containers' },
      { name: 'container_logs', description: 'View container logs' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/mcp-docker',
    source: 'community'
  },
  'filesystem': {
    category: 'File Management',
    description: 'Direct filesystem access for reading and writing files. Provides safe file system operations within configured directories.',
    icon: 'fa-folder',
    color: '#fdcb6e',
    availability: ['desktop', 'code'],
    capabilities: [
      { name: 'read_file', description: 'Read file contents' },
      { name: 'write_file', description: 'Write to files' },
      { name: 'list_directory', description: 'List directory contents' },
      { name: 'create_directory', description: 'Create directories' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/server-filesystem',
    source: 'anthropic'
  },
  'sqlite': {
    category: 'Database',
    description: 'SQLite database operations and queries. Execute SQL queries and manage SQLite databases.',
    icon: 'fa-database',
    color: '#003B57',
    availability: ['desktop', 'code'],
    capabilities: [
      { name: 'query', description: 'Execute SQL queries' },
      { name: 'insert', description: 'Insert data' },
      { name: 'update', description: 'Update records' },
      { name: 'delete', description: 'Delete records' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/server-sqlite',
    source: 'anthropic'
  },
  'postgres': {
    category: 'Database',
    description: 'PostgreSQL database operations and queries. Execute SQL queries and manage PostgreSQL databases.',
    icon: 'fa-database',
    color: '#336791',
    availability: ['desktop', 'code'],
    capabilities: [
      { name: 'query', description: 'Execute SQL queries' },
      { name: 'insert', description: 'Insert data' },
      { name: 'update', description: 'Update records' },
      { name: 'delete', description: 'Delete records' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/server-postgres',
    source: 'anthropic'
  },
  'gdrive': {
    category: 'Cloud Storage',
    description: 'Google Drive integration for file storage and sharing. Access and manage files in Google Drive.',
    icon: 'fa-brands fa-google-drive',
    color: '#4285F4',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'list_files', description: 'List files in Drive' },
      { name: 'read_file', description: 'Read file contents' },
      { name: 'write_file', description: 'Write to Drive' },
      { name: 'share_file', description: 'Share files' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/server-gdrive',
    source: 'anthropic'
  },
  'gmail': {
    category: 'Communication',
    description: 'Gmail integration for email management. Read, send, and manage emails through Gmail API.',
    icon: 'fa-envelope',
    color: '#EA4335',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'list_emails', description: 'List emails' },
      { name: 'read_email', description: 'Read email content' },
      { name: 'send_email', description: 'Send emails' },
      { name: 'search_emails', description: 'Search emails' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/server-gmail',
    source: 'anthropic'
  },
  'google-maps': {
    category: 'Location Services',
    description: 'Google Maps integration for location and mapping services. Geocoding, directions, and place information.',
    icon: 'fa-map-marked-alt',
    color: '#34A853',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'geocode', description: 'Convert addresses to coordinates' },
      { name: 'directions', description: 'Get directions between locations' },
      { name: 'search_places', description: 'Search for places' },
      { name: 'place_details', description: 'Get place information' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/server-google-maps',
    source: 'anthropic'
  },
  'youtube': {
    category: 'Media',
    description: 'YouTube integration for video information and transcripts. Search videos, get metadata, and access transcripts.',
    icon: 'fa-brands fa-youtube',
    color: '#FF0000',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'search_videos', description: 'Search YouTube videos' },
      { name: 'get_transcript', description: 'Get video transcripts' },
      { name: 'video_info', description: 'Get video metadata' }
    ],
    documentation: 'https://github.com/youtube-mcp/server',
    source: 'community'
  },
  'weather': {
    category: 'Data Services',
    description: 'Weather information and forecasts. Get current weather and forecasts using OpenWeatherMap.',
    icon: 'fa-cloud-sun',
    color: '#FF6B35',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'current_weather', description: 'Get current weather' },
      { name: 'forecast', description: 'Get weather forecast' },
      { name: 'location_search', description: 'Search locations' }
    ],
    documentation: 'https://github.com/mcp-weather/server',
    source: 'community'
  },
  'time': {
    category: 'Utilities',
    description: 'Time and timezone utilities. Get current time in different timezones and perform time conversions.',
    icon: 'fa-clock',
    color: '#0984e3',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'current_time', description: 'Get current time' },
      { name: 'convert_timezone', description: 'Convert between timezones' },
      { name: 'time_difference', description: 'Calculate time differences' }
    ],
    documentation: 'https://github.com/modelcontextprotocol/server-time',
    source: 'anthropic'
  },
  'calendar': {
    category: 'Productivity',
    description: 'Calendar integration for event management. Create and manage calendar events.',
    icon: 'fa-calendar',
    color: '#fdcb6e',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'list_events', description: 'List calendar events' },
      { name: 'create_event', description: 'Create new events' },
      { name: 'update_event', description: 'Update existing events' },
      { name: 'delete_event', description: 'Delete events' }
    ],
    documentation: 'https://github.com/calendar-mcp/server',
    source: 'community'
  },
  'prisma': {
    category: 'Database',
    description: 'Prisma ORM integration for database management. Interact with databases using Prisma schema and queries.',
    icon: 'fa-database',
    color: '#2D3748',
    availability: ['desktop', 'code'],
    capabilities: [
      { name: 'query_model', description: 'Query Prisma models' },
      { name: 'create_record', description: 'Create database records' },
      { name: 'update_record', description: 'Update records' },
      { name: 'delete_record', description: 'Delete records' }
    ],
    documentation: 'https://github.com/prisma-mcp/server',
    source: 'community'
  },
  'raycast': {
    category: 'Productivity',
    description: 'Raycast integration for Mac productivity. Control Raycast and access its features programmatically.',
    icon: 'fa-rocket',
    color: '#FF6363',
    availability: ['desktop'],
    capabilities: [
      { name: 'run_command', description: 'Run Raycast commands' },
      { name: 'search', description: 'Search Raycast' },
      { name: 'clipboard_history', description: 'Access clipboard history' }
    ],
    documentation: 'https://github.com/raycast-mcp/server',
    source: 'community'
  },
  'n8n': {
    category: 'Automation',
    description: 'n8n workflow automation integration. Trigger and manage n8n workflows programmatically.',
    icon: 'fa-project-diagram',
    color: '#FF6D5A',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'trigger_workflow', description: 'Trigger n8n workflows' },
      { name: 'list_workflows', description: 'List available workflows' },
      { name: 'workflow_status', description: 'Get workflow status' }
    ],
    documentation: 'https://github.com/leonardsellem/n8n-mcp-server',
    source: 'community'
  },
  'slack': {
    category: 'Communication',
    description: 'Slack integration for team communication. Send messages, read channels, and manage Slack workspaces.',
    icon: 'fa-brands fa-slack',
    color: '#4A154B',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'send_message', description: 'Send Slack messages' },
      { name: 'list_channels', description: 'List channels' },
      { name: 'read_messages', description: 'Read channel messages' }
    ],
    documentation: 'https://github.com/slack-mcp/server',
    source: 'community'
  },
  'notion': {
    category: 'Productivity',
    description: 'Notion integration for notes and databases. Access and manage Notion pages and databases.',
    icon: 'fa-book',
    color: '#000000',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'query_database', description: 'Query Notion databases' },
      { name: 'create_page', description: 'Create new pages' },
      { name: 'update_page', description: 'Update existing pages' }
    ],
    documentation: 'https://github.com/notion-mcp/server',
    source: 'community'
  },
  'linear': {
    category: 'Project Management',
    description: 'Linear integration for issue tracking. Create and manage Linear issues and projects.',
    icon: 'fa-tasks',
    color: '#5E6AD2',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'create_issue', description: 'Create Linear issues' },
      { name: 'list_issues', description: 'List issues' },
      { name: 'update_issue', description: 'Update issues' }
    ],
    documentation: 'https://github.com/linear-mcp/server',
    source: 'community'
  },
  'jira': {
    category: 'Project Management',
    description: 'Jira integration for project management. Create and manage Jira issues, sprints, and boards.',
    icon: 'fa-brands fa-jira',
    color: '#0052CC',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'create_issue', description: 'Create Jira issues' },
      { name: 'list_issues', description: 'List issues' },
      { name: 'update_issue', description: 'Update issues' },
      { name: 'transition_issue', description: 'Change issue status' }
    ],
    documentation: 'https://github.com/jira-mcp/server',
    source: 'community'
  },
  'ide': {
    category: 'Development Tools',
    description: 'IDE integration for code editing and navigation. Interact with your IDE programmatically.',
    icon: 'fa-code',
    color: '#0984e3',
    availability: ['desktop', 'code'],
    capabilities: [
      { name: 'open_file', description: 'Open files in IDE' },
      { name: 'navigate_to', description: 'Navigate to code location' },
      { name: 'run_command', description: 'Run IDE commands' }
    ],
    documentation: 'https://github.com/ide-mcp/server',
    source: 'community'
  },
  'brave-search': {
    category: 'Search',
    description: 'Brave Search integration for web searches. Perform web searches using Brave Search API.',
    icon: 'fa-search',
    color: '#FB542B',
    availability: ['desktop', 'code', 'web'],
    capabilities: [
      { name: 'web_search', description: 'Search the web' },
      { name: 'image_search', description: 'Search for images' },
      { name: 'news_search', description: 'Search news articles' }
    ],
    documentation: 'https://github.com/brave-search-mcp/server',
    source: 'community'
  }
};

async function importMcps(configPath) {
  console.log('🌱 Starting MCP import from repository...\\n');

  try {
    // Read the config file
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);

    if (!config.mcpServers) {
      throw new Error('Invalid config format: missing mcpServers');
    }

    const mcpServers = config.mcpServers;
    const mcpNames = Object.keys(mcpServers);

    console.log(`📋 Found ${mcpNames.length} MCPs in config\\n`);

    // Clear existing MCPs
    console.log('🧹 Clearing existing MCPs...');
    await prisma.mcp.deleteMany();
    console.log('   ✅ Cleared\\n');

    // Import each MCP
    console.log(`📦 Importing MCPs...\\n`);

    let imported = 0;
    let skipped = 0;

    for (const [mcpKey, mcpConfig] of Object.entries(mcpServers)) {
      // Normalize the key to match metadata
      const normalizedKey = mcpKey.toLowerCase().replace(/_/g, '-');
      const metadata = MCP_METADATA[normalizedKey];

      if (!metadata) {
        console.log(`   ⚠️  Skipping ${mcpKey}: No metadata available`);
        skipped++;
        continue;
      }

      // Build configuration object
      const configuration = {
        command: mcpConfig.command,
        args: mcpConfig.args
      };

      if (mcpConfig.env) {
        configuration.env = mcpConfig.env;
      }

      // Generate config example
      const configExample = JSON.stringify({
        mcpServers: {
          [mcpKey]: mcpConfig
        }
      }, null, 2);

      // Create MCP record
      await prisma.mcp.create({
        data: {
          name: metadata.name || mcpKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          category: metadata.category,
          description: metadata.description,
          icon: metadata.icon,
          color: metadata.color,
          availability: metadata.availability,
          configuration: configuration,
          configExample: configExample,
          capabilities: metadata.capabilities,
          toolCount: metadata.capabilities.length,
          documentation: metadata.documentation || null,
          githubUrl: metadata.githubUrl || null,
          source: metadata.source || 'github',
          status: 'active',
          isFavorite: false,
          usageCount: 0
        }
      });

      console.log(`   ✅ ${mcpKey} (${metadata.capabilities.length} tools)`);
      imported++;
    }

    console.log(`\\n✅ Successfully imported ${imported} MCPs!`);
    if (skipped > 0) {
      console.log(`⚠️  Skipped ${skipped} MCPs (no metadata available)`);
    }

    // Show statistics
    const stats = await prisma.mcp.groupBy({
      by: ['category'],
      _count: true
    });

    console.log('\\n📊 Import Statistics:');
    console.log('   Category Breakdown:');
    stats.forEach(stat => {
      console.log(`   - ${stat.category}: ${stat._count} MCPs`);
    });

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run importer
const configPath = process.argv[2] || '/tmp/mcp-configs/claude_config.json';

importMcps(configPath)
  .then(() => {
    console.log('\\n🎉 Import complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
