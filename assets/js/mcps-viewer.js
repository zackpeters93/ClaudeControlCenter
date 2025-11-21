/**
 * MCPs Viewer - JavaScript
 * View and understand MCP server configurations
 */

// Comprehensive MCP Server Data
const MCP_SERVERS = [
    {
        id: 'desktop-commander',
        name: 'Desktop Commander',
        status: 'active',
        icon: 'fa-terminal',
        color: '#d63031',
        availability: { desktop: true, code: true, web: false },
        description: 'File operations, terminal access, and process management',
        toolCount: 20,
        category: 'File Management & System',
        configuration: {
            command: 'npx',
            args: ['-y', '@tech-by-design/desktop-commander']
        },
        configExample: `{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@tech-by-design/desktop-commander"]
    }
  }
}`,
        capabilities: [
            'Read, write, and edit files',
            'Directory management and search',
            'Terminal process execution',
            'Interactive REPL sessions',
            'File and content search'
        ],
        installation: 'npm install -g @tech-by-design/desktop-commander',
        documentation: 'https://github.com/QuantGeekDev/desktop-commander',
        notes: 'Primary tool for local file operations. Essential for data analysis with Python/Node REPLs.'
    },
    {
        id: 'sequential-thinking',
        name: 'Sequential-Thinking',
        status: 'active',
        icon: 'fa-brain',
        color: '#0984e3',
        availability: { desktop: true, code: true, web: true },
        description: 'Dynamic problem-solving through adaptive thinking process',
        toolCount: 1,
        category: 'Planning & Analysis',
        configuration: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-sequential-thinking']
        },
        configExample: `{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}`,
        capabilities: [
            'Multi-step problem solving',
            'Branching and revision support',
            'Hypothesis generation and verification',
            'Adaptive planning'
        ],
        installation: 'npm install -g @modelcontextprotocol/server-sequential-thinking',
        documentation: 'https://github.com/sequentialthinking/mcp',
        notes: 'Critical for complex planning and architecture decisions. Allows revising thoughts as understanding deepens.'
    },
    {
        id: 'github',
        name: 'GitHub MCP',
        status: 'active',
        icon: 'fa-brands fa-github',
        color: '#2d3436',
        availability: { desktop: true, code: true, web: true },
        description: 'Complete GitHub integration for repositories and collaboration',
        toolCount: 27,
        category: 'Version Control',
        configuration: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-github'],
            env: { GITHUB_TOKEN: 'your-token-here' }
        },
        configExample: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_personal_access_token"
      }
    }
  }
}`,
        capabilities: [
            'Repository management',
            'Pull request creation and merging',
            'Issue tracking',
            'Code search across GitHub',
            'Branch and commit management',
            'File operations'
        ],
        installation: 'npm install -g @modelcontextprotocol/server-github',
        documentation: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
        notes: 'Requires GitHub Personal Access Token with appropriate scopes. Essential for code collaboration.'
    },
    {
        id: 'memory',
        name: 'Memory',
        status: 'active',
        icon: 'fa-database',
        color: '#00b894',
        availability: { desktop: true, code: true, web: true },
        description: 'Knowledge graph for persistent context management',
        toolCount: 9,
        category: 'Context & Memory',
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
            'Create and manage entities',
            'Define relationships',
            'Add observations',
            'Search knowledge graph',
            'Persistent context across sessions'
        ],
        installation: 'npm install -g @modelcontextprotocol/server-memory',
        documentation: 'https://github.com/anthropics/mcp-memory',
        notes: 'Maintains persistent knowledge about users, projects, and preferences across conversations.'
    },
    {
        id: 'fetch',
        name: 'Fetch',
        status: 'active',
        icon: 'fa-globe',
        color: '#0984e3',
        availability: { desktop: true, code: true, web: true },
        description: 'Web content fetching with markdown conversion',
        toolCount: 1,
        category: 'Web Operations',
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
            'Fetch web pages',
            'Convert HTML to markdown',
            'Handle redirects',
            'Extract content'
        ],
        installation: 'npm install -g @modelcontextprotocol/server-fetch',
        documentation: 'https://github.com/modelcontextprotocol/mcp-fetch',
        notes: 'Useful for retrieving documentation, articles, and web-based information.'
    },
    {
        id: 'puppeteer',
        name: 'Puppeteer',
        status: 'active',
        icon: 'fa-robot',
        color: '#fdcb6e',
        availability: { desktop: true, code: true, web: false },
        description: 'Browser automation for web interaction and testing',
        toolCount: 7,
        category: 'Web Automation',
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
            'Navigate to URLs',
            'Take screenshots',
            'Click and interact with elements',
            'Fill forms',
            'Execute JavaScript in browser',
            'Automate web workflows'
        ],
        installation: 'npm install -g @modelcontextprotocol/server-puppeteer',
        documentation: 'https://github.com/modelcontextprotocol/mcp-puppeteer',
        notes: 'Powerful for web scraping, testing, and automation. Can run headless or with visible browser.'
    },
    {
        id: 'figma',
        name: 'Figma',
        status: 'active',
        icon: 'fa-figma',
        color: '#d63031',
        availability: { desktop: true, code: true, web: true },
        description: 'Figma integration for design file access',
        toolCount: 5,
        category: 'Design Tools',
        configuration: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-figma'],
            env: { FIGMA_ACCESS_TOKEN: 'your-token-here' }
        },
        configExample: `{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_your_figma_token"
      }
    }
  }
}`,
        capabilities: [
            'Access Figma files',
            'View design nodes',
            'Read comments',
            'Post comments',
            'Design collaboration'
        ],
        installation: 'npm install -g @modelcontextprotocol/server-figma',
        documentation: 'https://github.com/modelcontextprotocol/mcp-figma',
        notes: 'Requires Figma access token. Useful for design review and documentation workflows.'
    }
];

/**
 * Initialize MCPs Viewer
 */
function initMCPsViewer() {
    renderMCPs();
    renderEnvironmentMatrix();
    updateStats();
}

/**
 * Render MCP servers grid
 */
function renderMCPs() {
    const grid = document.getElementById('mcpsGrid');
    grid.innerHTML = '';
    
    MCP_SERVERS.forEach(mcp => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        const card = document.createElement('div');
        card.className = 'card mcp-card';
        card.onclick = () => showMCPDetail(mcp);
        
        // Environment badges
        const envBadges = [];
        if (mcp.availability.desktop) envBadges.push('<span class="badge bg-primary env-badge">Desktop</span>');
        if (mcp.availability.code) envBadges.push('<span class="badge bg-success env-badge">Code</span>');
        if (mcp.availability.web) envBadges.push('<span class="badge bg-info env-badge">Web</span>');
        
        // Status indicator
        const statusClass = mcp.status === 'active' ? 'status-active' : 'status-inactive';
        const statusText = mcp.status === 'active' ? 'Active' : 'Inactive';
        
        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <i class="fas ${mcp.icon} fa-2x" style="color: ${mcp.color};"></i>
                    <div>
                        <span class="status-indicator ${statusClass}"></span>
                        <small class="text-muted">${statusText}</small>
                    </div>
                </div>
                
                <h5 class="card-title">${mcp.name}</h5>
                
                <p class="card-text small">${mcp.description}</p>
                
                <div class="mb-2">
                    ${envBadges.join('')}
                </div>
                
                <span class="badge bg-secondary" style="font-size: 0.75rem;">${mcp.category}</span>
                
                <div class="mt-3 small text-muted">
                    <i class="fas fa-tools"></i> ${mcp.toolCount} tools
                </div>
            </div>
        `;
        
        col.appendChild(card);
        grid.appendChild(col);
    });
}

/**
 * Render environment availability matrix
 */
function renderEnvironmentMatrix() {
    const tbody = document.getElementById('environmentMatrix');
    tbody.innerHTML = '';
    
    MCP_SERVERS.forEach(mcp => {
        const row = document.createElement('tr');
        
        const checkIcon = '<i class="fas fa-check text-success"></i>';
        const crossIcon = '<i class="fas fa-times text-danger"></i>';
        
        row.innerHTML = `
            <td><strong>${mcp.name}</strong></td>
            <td class="text-center">${mcp.availability.desktop ? checkIcon : crossIcon}</td>
            <td class="text-center">${mcp.availability.code ? checkIcon : crossIcon}</td>
            <td class="text-center">${mcp.availability.web ? checkIcon : crossIcon}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Show MCP detail modal
 */
function showMCPDetail(mcp) {
    document.getElementById('modalMcpName').textContent = mcp.name;
    
    // Build capabilities list
    const capabilitiesList = mcp.capabilities.map(cap => `<li>${cap}</li>`).join('');
    
    // Build environment availability
    const envBadges = [];
    if (mcp.availability.desktop) envBadges.push('<span class="badge bg-primary me-1">Desktop</span>');
    if (mcp.availability.code) envBadges.push('<span class="badge bg-success me-1">Code</span>');
    if (mcp.availability.web) envBadges.push('<span class="badge bg-info me-1">Web</span>');
    
    // Status indicator
    const statusClass = mcp.status === 'active' ? 'success' : 'secondary';
    const statusText = mcp.status === 'active' ? 'Active' : 'Inactive';
    
    const content = `
        <div class="mb-3">
            <i class="fas ${mcp.icon} fa-3x mb-3" style="color: ${mcp.color};"></i>
            <p class="lead">${mcp.description}</p>
        </div>
        
        <div class="mb-3">
            <span class="badge bg-${statusClass}">${statusText}</span>
            <span class="badge bg-secondary ms-2">${mcp.category}</span>
            <span class="badge bg-info ms-2">${mcp.toolCount} Tools</span>
        </div>
        
        <div class="mb-3">
            <strong>Available in:</strong><br>
            ${envBadges.join('')}
        </div>
        
        <hr>
        
        <h6><i class="fas fa-cogs"></i> Capabilities</h6>
        <ul class="small">
            ${capabilitiesList}
        </ul>
        
        <hr>
        
        <h6><i class="fas fa-code"></i> Configuration Example</h6>
        <div class="config-code">
            <pre style="margin: 0; color: #dfe6e9;">${mcp.configExample}</pre>
        </div>
        
        <hr>
        
        <h6><i class="fas fa-download"></i> Installation</h6>
        <div class="config-code">
            ${mcp.installation}
        </div>
        
        <hr>
        
        <h6><i class="fas fa-info-circle"></i> Notes</h6>
        <p class="small">${mcp.notes}</p>
        
        <div class="mt-3">
            <a href="${mcp.documentation}" target="_blank" class="btn btn-primary">
                <i class="fas fa-book"></i> Documentation
            </a>
        </div>
    `;
    
    document.getElementById('modalMcpContent').innerHTML = content;
    
    const modal = new bootstrap.Modal(document.getElementById('mcpDetailModal'));
    modal.show();
}

/**
 * Update statistics
 */
function updateStats() {
    const totalServers = MCP_SERVERS.length;
    const activeServers = MCP_SERVERS.filter(m => m.status === 'active').length;
    const totalTools = MCP_SERVERS.reduce((sum, m) => sum + m.toolCount, 0);
    const environments = 3; // Desktop, Code, Web
    
    document.getElementById('totalServers').textContent = totalServers;
    document.getElementById('activeServers').textContent = activeServers;
    document.getElementById('totalTools').textContent = totalTools + '+';
    document.getElementById('environments').textContent = environments;
}

// Initialize when page loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initMCPsViewer);
}
