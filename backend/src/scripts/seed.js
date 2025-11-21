/**
 * Database Seeder - Populate with initial data
 * Run with: node src/scripts/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Skills data from frontend
const SKILLS_DATA = [
    {
        name: 'Desktop Commander',
        category: 'File Management',
        priority: 'critical',
        icon: 'fa-terminal',
        color: '#d63031',
        availability: ['desktop', 'code'],
        tools: [
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
        usageExamples: [
            'Analyze CSV files with Python REPL',
            'Search codebase for patterns',
            'Execute terminal commands and scripts',
            'Manage project files and directories',
            'Process data with interactive shells'
        ],
        documentation: 'https://github.com/QuantGeekDev/desktop-commander',
        source: 'manual'
    },
    {
        name: 'Sequential-Thinking',
        category: 'Planning',
        priority: 'critical',
        icon: 'fa-brain',
        color: '#0984e3',
        availability: ['desktop', 'code', 'web'],
        tools: [
            { name: 'sequentialthinking', description: 'Execute thinking process with branching and revision' }
        ],
        usageExamples: [
            'Break down complex projects',
            'Plan architecture with revision',
            'Analyze problems needing course correction',
            'Design systems where scope may evolve'
        ],
        documentation: 'https://github.com/sequentialthinking/mcp',
        source: 'manual'
    },
    {
        name: 'GitHub',
        category: 'Version Control',
        priority: 'high',
        icon: 'fa-brands fa-github',
        color: '#2d3436',
        availability: ['desktop', 'code', 'web'],
        tools: [
            { name: 'create_or_update_file', description: 'Create or update repository files' },
            { name: 'search_repositories', description: 'Search GitHub repositories' },
            { name: 'create_repository', description: 'Create new repositories' },
            { name: 'push_files', description: 'Push multiple files in one commit' },
            { name: 'create_pull_request', description: 'Create pull requests' },
            { name: 'merge_pull_request', description: 'Merge pull requests' }
        ],
        usageExamples: [
            'Create and manage repositories',
            'Search for code across GitHub',
            'Manage pull requests and issues',
            'Automate code deployments'
        ],
        documentation: 'https://docs.github.com/en/rest',
        source: 'manual'
    },
    {
        name: 'Memory',
        category: 'Knowledge Management',
        priority: 'high',
        icon: 'fa-brain',
        color: '#00b894',
        availability: ['desktop', 'code', 'web'],
        tools: [
            { name: 'create_entities', description: 'Create knowledge graph entities' },
            { name: 'create_relations', description: 'Create entity relations' },
            { name: 'add_observations', description: 'Add observations to entities' },
            { name: 'search_nodes', description: 'Search knowledge graph' },
            { name: 'read_graph', description: 'Read entire knowledge graph' }
        ],
        usageExamples: [
            'Build knowledge graphs',
            'Track project information',
            'Create entity relationships',
            'Search accumulated knowledge'
        ],
        documentation: 'https://github.com/anthropics/mcp-memory',
        source: 'manual'
    },
    {
        name: 'Fetch',
        category: 'Web Access',
        priority: 'high',
        icon: 'fa-globe',
        color: '#0984e3',
        availability: ['desktop', 'code', 'web'],
        tools: [
            { name: 'fetch', description: 'Fetch URL content with markdown conversion' }
        ],
        usageExamples: [
            'Fetch web pages',
            'Convert HTML to markdown',
            'Access documentation',
            'Retrieve web content'
        ],
        documentation: 'https://github.com/anthropics/mcp-fetch',
        source: 'manual'
    },
    {
        name: 'Puppeteer',
        category: 'Browser Automation',
        priority: 'medium',
        icon: 'fa-robot',
        color: '#00b894',
        availability: ['desktop', 'code'],
        tools: [
            { name: 'puppeteer_navigate', description: 'Navigate to URL' },
            { name: 'puppeteer_screenshot', description: 'Take screenshots' },
            { name: 'puppeteer_click', description: 'Click elements' },
            { name: 'puppeteer_fill', description: 'Fill input fields' },
            { name: 'puppeteer_evaluate', description: 'Execute JavaScript' }
        ],
        usageExamples: [
            'Automate browser interactions',
            'Take screenshots',
            'Fill forms programmatically',
            'Test web applications'
        ],
        documentation: 'https://github.com/anthropics/mcp-puppeteer',
        source: 'manual'
    },
    {
        name: 'Figma',
        category: 'Design',
        priority: 'medium',
        icon: 'fa-figma',
        color: '#fdcb6e',
        availability: ['desktop', 'code', 'web'],
        tools: [
            { name: 'add_figma_file', description: 'Add Figma file to context' },
            { name: 'view_node', description: 'View node thumbnail' },
            { name: 'read_comments', description: 'Read file comments' },
            { name: 'post_comment', description: 'Post comments' }
        ],
        usageExamples: [
            'Access Figma designs',
            'Read design comments',
            'View design nodes',
            'Collaborate on designs'
        ],
        documentation: 'https://github.com/anthropics/mcp-figma',
        source: 'manual'
    }
];

// Agents data
const AGENTS_DATA = [
    {
        name: 'General-Purpose Agent',
        type: 'general-purpose',
        description: 'Autonomous multi-step task execution with full tool access',
        icon: 'fa-robot',
        color: '#0984e3',
        parallelCapable: true,
        whenToUse: [
            'Complex multi-step tasks',
            'Tasks combining research + code',
            'Autonomous problem-solving',
            'Long-running workflows'
        ],
        examplePrompts: [
            { title: 'Complex refactoring', prompt: 'Search for old API pattern, update to new pattern, run tests' },
            { title: 'Feature implementation', prompt: 'Research auth patterns, implement JWT, add tests' }
        ],
        source: 'manual'
    },
    {
        name: 'Explore Agent',
        type: 'explore',
        description: 'Specialized codebase exploration with thoroughness levels',
        icon: 'fa-search',
        color: '#00b894',
        parallelCapable: true,
        thoroughnessLevels: ['quick', 'medium', 'very thorough'],
        whenToUse: [
            'Open-ended exploration',
            'Understanding architecture',
            'Finding implementations',
            'Multiple search rounds'
        ],
        examplePrompts: [
            { title: 'Quick exploration', prompt: 'Explore authentication system (quick)' },
            { title: 'Thorough analysis', prompt: 'Understand error handling (very thorough)' }
        ],
        source: 'manual'
    },
    {
        name: 'Plan Agent',
        type: 'plan',
        description: 'Structured planning for implementation tasks',
        icon: 'fa-list-check',
        color: '#fdcb6e',
        parallelCapable: true,
        whenToUse: [
            'Planning implementation',
            'Architecture decisions',
            'Feature design',
            'Code organization'
        ],
        examplePrompts: [
            { title: 'Feature planning', prompt: 'Plan user authentication feature' },
            { title: 'Refactor planning', prompt: 'Plan API refactoring strategy' }
        ],
        source: 'manual'
    },
    {
        name: 'Statusline-Setup Agent',
        type: 'statusline-setup',
        description: 'Configure Claude Code status line settings',
        icon: 'fa-cog',
        color: '#636e72',
        parallelCapable: false,
        whenToUse: [
            'Configure statusline',
            'Update IDE settings',
            'Customize display'
        ],
        examplePrompts: [
            { title: 'Setup statusline', prompt: 'Configure my Claude Code statusline' }
        ],
        source: 'manual'
    }
];

// MCP Servers data
const MCPS_DATA = [
    {
        name: 'Desktop Commander',
        description: 'File operations and terminal access',
        configuration: {
            command: 'npx',
            args: ['-y', '@tech-by-design/desktop-commander']
        },
        configExample: JSON.stringify({
            'mcp-desktop-commander': {
                command: 'npx',
                args: ['-y', '@tech-by-design/desktop-commander']
            }
        }, null, 2),
        capabilities: ['File Operations', 'Terminal Access', 'Process Management'],
        availability: ['desktop', 'code'],
        status: 'active',
        toolCount: 11,
        source: 'manual'
    },
    {
        name: 'Sequential-Thinking',
        description: 'Dynamic problem-solving through flexible thinking',
        configuration: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-sequential-thinking']
        },
        configExample: JSON.stringify({
            'mcp-sequential-thinking': {
                command: 'npx',
                args: ['-y', '@modelcontextprotocol/server-sequential-thinking']
            }
        }, null, 2),
        capabilities: ['Planning', 'Analysis', 'Problem Solving'],
        availability: ['desktop', 'code', 'web'],
        status: 'active',
        toolCount: 1,
        source: 'manual'
    },
    {
        name: 'GitHub',
        description: 'Complete GitHub integration',
        configuration: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-github'],
            env: { GITHUB_PERSONAL_ACCESS_TOKEN: '<your-token>' }
        },
        configExample: JSON.stringify({
            'mcp-github': {
                command: 'npx',
                args: ['-y', '@modelcontextprotocol/server-github'],
                env: { GITHUB_PERSONAL_ACCESS_TOKEN: '<your-token>' }
            }
        }, null, 2),
        capabilities: ['Repository Management', 'Pull Requests', 'Issues', 'Code Search'],
        availability: ['desktop', 'code', 'web'],
        status: 'active',
        toolCount: 15,
        source: 'manual'
    }
];

// Templates data
const TEMPLATES_DATA = [
    {
        name: 'HTML Project - American Palette',
        description: 'Bootstrap 5 with American Palette flat design',
        category: 'Web Development',
        structure: 'ProjectName/\n├── index.html\n├── assets/\n│   ├── css/\n│   └── js/',
        files: [
            {
                name: 'index.html',
                content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <title>Project</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>'
            }
        ],
        language: 'html',
        framework: 'Bootstrap 5',
        tags: ['html', 'bootstrap', 'american-palette', 'web'],
        source: 'manual'
    },
    {
        name: 'Python FastAPI Project',
        description: 'FastAPI backend with async support',
        category: 'Backend',
        structure: 'project/\n├── main.py\n├── requirements.txt\n├── tests/',
        files: [
            {
                name: 'main.py',
                content: 'from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/")\nasync def root():\n    return {"message": "Hello World"}'
            }
        ],
        language: 'python',
        framework: 'FastAPI',
        tags: ['python', 'fastapi', 'backend', 'api'],
        source: 'manual'
    },
    {
        name: 'Embedded LVGL Project',
        description: 'LVGL UI framework for embedded systems',
        category: 'Embedded',
        structure: 'project/\n├── main.c\n├── platformio.ini',
        files: [
            {
                name: 'platformio.ini',
                content: '[env:rp2350]\nplatform = raspberrypi\nboard = pico2\nframework = arduino'
            }
        ],
        language: 'c',
        framework: 'LVGL',
        tags: ['embedded', 'lvgl', 'rp2350', 'esp32'],
        source: 'manual'
    }
];

async function seed() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await prisma.skill.deleteMany();
        await prisma.agent.deleteMany();
        await prisma.mcp.deleteMany();
        await prisma.template.deleteMany();
        console.log('✅ Existing data cleared\n');

        // Seed Skills
        console.log('📚 Seeding Skills...');
        for (const skill of SKILLS_DATA) {
            await prisma.skill.create({ data: skill });
            console.log(`  ✓ ${skill.name}`);
        }
        console.log(`✅ ${SKILLS_DATA.length} skills seeded\n`);

        // Seed Agents
        console.log('🤖 Seeding Agents...');
        for (const agent of AGENTS_DATA) {
            await prisma.agent.create({ data: agent });
            console.log(`  ✓ ${agent.name}`);
        }
        console.log(`✅ ${AGENTS_DATA.length} agents seeded\n`);

        // Seed MCPs
        console.log('🔌 Seeding MCPs...');
        for (const mcp of MCPS_DATA) {
            await prisma.mcp.create({ data: mcp });
            console.log(`  ✓ ${mcp.name}`);
        }
        console.log(`✅ ${MCPS_DATA.length} MCPs seeded\n`);

        // Seed Templates
        console.log('📝 Seeding Templates...');
        for (const template of TEMPLATES_DATA) {
            await prisma.template.create({ data: template });
            console.log(`  ✓ ${template.name}`);
        }
        console.log(`✅ ${TEMPLATES_DATA.length} templates seeded\n`);

        console.log('🎉 Database seeding completed successfully!');
        console.log('\nYou can now access the data at:');
        console.log('  http://localhost:3000/api/skills');
        console.log('  http://localhost:3000/api/agents');
        console.log('  http://localhost:3000/api/mcps');
        console.log('  http://localhost:3000/api/templates\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run seeder
seed();
