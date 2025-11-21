/**
 * Claude Control Center - Main JavaScript
 * Data Management and Configuration Logic
 */

// Configuration key for localStorage
const CONFIG_KEY = 'claude_control_center_config';

// Default configuration structure with pre-loaded sections
const DEFAULT_CONFIG = {
    version: '1.0.0',
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    claude: {
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
                content: 'These are hard on/off rules that MUST be followed:\n\n**Documentation & Files:**\n- ❌ NEVER use markdown files (.md) for project documentation\n- ✅ ALWAYS use HTML files with Bootstrap styling\n- ✅ ALWAYS use the American Palette color scheme (Flat UI Colors 2)\n- ❌ NEVER use gradients - ALWAYS flat design only\n- ✅ ALWAYS archive previous versions with timestamps instead of overwriting\n\n**Project Management:**\n- ✅ ALWAYS ask "Do you want me to create a Project documentation website?" as first response\n- ✅ ALWAYS create new directories in /Users/techdev/Projects/ClaudeDC/ (unless Python: /Users/techdev/Development/Python)\n- ✅ ALWAYS create unique folders for each new codebase\n- ✅ ALWAYS use Sequential-Thinking for complex planning\n- ✅ ALWAYS break work into efficient steps\n\n**Tool Usage:**\n- ✅ ALWAYS use Desktop Commander for file operations and terminal access\n- ✅ ALWAYS use Context7 for pulling latest documentation\n- ✅ ALWAYS use proper MCP tool formats with <function_calls> tags\n- ❌ NEVER use placeholder formats like [tool: query]\n\n**Content & Copyright:**\n- ❌ NEVER quote or reproduce song lyrics (even in artifacts)\n- ❌ NEVER reproduce copyrighted material verbatim (>25 words)\n- ✅ ALWAYS paraphrase and cite sources appropriately\n- ✅ ALWAYS use citations when content is from web_search or other tools',
                context: ['all'],
                priority: 1
            },
            {
                id: 'decision-trees',
                title: 'Decision Trees & Logic',
                enabled: true,
                content: '**Information Currency Assessment:**\n```\nIF information is timeless (fundamental concepts, historical facts)\n  → Answer directly without searching\nELSE IF information changes slowly (annual statistics, stable facts)\n  → Answer first, THEN offer to search for latest data\nELSE IF information is current/live (prices, news, events, elections)\n  → Search immediately before answering\n```\n\n**Tool Selection Priority:**\n```\n1. Desktop Commander (CRITICAL for local operations)\n   - File operations (read, write, create, move)\n   - Terminal commands and process management\n   - Local file analysis (CSV, JSON, logs - use processes NOT analysis tool)\n   - start_process for Python REPLs, data analysis\n\n2. Sequential-Thinking (HIGH for complex tasks)\n   - Complex project planning\n   - Multi-step problem solving\n   - Architecture decisions\n   - Breaking down ambiguous requirements\n\n3. Context7 (HIGH for documentation)\n   - Latest documentation retrieval\n   - SDK and API references\n   - Technology updates and changes\n\n4. Web Search (MEDIUM/HIGH for current info)\n   - Current events and news\n   - Real-time data (prices, weather, election results)\n   - Verification of recent changes\n   - When asked about latest/current/recent anything\n\n5. Specialized MCPs (AS NEEDED)\n   - GitHub for repository operations\n   - Google Drive for document management\n   - Memory tools for context retention\n   - Fetch for retrieving specific URLs\n```\n\n**Project Type Detection:**\n```\nIF user mentions specific local files/data\n  → Use Desktop Commander + start_process for analysis\n  → NEVER use analysis tool for local files\n\nELSE IF user asks about current events/latest news\n  → Use web_search immediately\n\nELSE IF request involves code repository\n  → Use GitHub MCP\n\nELSE IF request involves Google Docs\n  → Use google_drive_search or google_drive_fetch\n\nELSE IF user asks to create project\n  → Ask about documentation website first\n  → Use Sequential-Thinking to plan\n  → Use Desktop Commander to execute\n```',
                context: ['all'],
                priority: 1
            },
            {
                id: 'design-system',
                title: 'Design System & Preferences',
                enabled: true,
                content: '**Color Palette (American Palette - Flat UI Colors 2):**\n\nPrimary Colors:\n- Dracula Orchid (#2d3436) - Headers, primary text, dark backgrounds\n- City Lights (#dfe6e9) - Light backgrounds, secondary text\n- Electron Blue (#0984e3) - Links, primary actions, interactive elements\n- Chi-Gong (#d63031) - Alerts, warnings, danger actions\n\nSecondary Colors:\n- Mint Leaf (#00b894) - Success states, positive feedback\n- Bright Yarrow (#fdcb6e) - Highlights, accents, warnings\n\n**UI Framework:**\n- Bootstrap 5.3+ (https://getbootstrap.com/)\n- Font Awesome 6 for icons (https://fontawesome.com/)\n- Chart.js for visualizations (https://www.chartjs.org/)\n\n**Design Rules:**\n- ❌ ABSOLUTELY NO GRADIENTS - Flat design only\n- ✅ Use solid colors from the American Palette\n- ✅ Responsive design for all screen sizes\n- ✅ Clean, professional layouts\n- ✅ Consistent spacing and typography\n\n**File Structure for Projects:**\n```\nProjectName/\n├── index.html (always the latest version)\n├── assets/\n│   ├── css/custom.css (American Palette styling)\n│   ├── js/main.js\n│   └── data/ (JSON files for data)\n├── archive/ (timestamped previous versions)\n└── README.md (brief overview only)\n```',
                context: ['all'],
                priority: 1
            }
        ],
        lastUpdate: new Date().toISOString(),
        characterCount: 3500
    },
    designSystem: {
        colorPalette: {
            primary: {
                draculaOrchid: '#2d3436',
                cityLights: '#dfe6e9',
                electronBlue: '#0984e3',
                chiGong: '#d63031'
            },
            secondary: {
                mintLeaf: '#00b894',
                brightYarrow: '#fdcb6e'
            }
        },
        typography: {
            framework: 'Bootstrap 5',
            icons: 'Font Awesome 6'
        },
        rules: ['Flat Design', 'No Gradients', 'American Palette']
    },
    skills: [],
    agents: [],
    mcps: [
        { name: 'Desktop Commander', category: 'File Management', priority: 'critical' },
        { name: 'Sequential-Thinking', category: 'Planning', priority: 'high' },
        { name: 'Context7', category: 'Documentation', priority: 'high' },
        { name: 'Web Search', category: 'Research', priority: 'high' }
    ],
    templates: [],
    recentActivity: [
        { timestamp: new Date().toISOString(), title: 'System Initialized', description: 'Claude Control Center created' }
    ]
};

/**
 * Load configuration from localStorage
 * @returns {Object} Configuration object
 */
function loadConfiguration() {
    try {
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
    return { ...DEFAULT_CONFIG };
}

/**
 * Save configuration to localStorage
 * @param {Object} config - Configuration object to save
 */
function saveConfiguration(config) {
    try {
        config.lastModified = new Date().toISOString();
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        return true;
    } catch (error) {
        console.error('Error saving configuration:', error);
        return false;
    }
}

/**
 * Add activity to recent activity log
 * @param {string} title - Activity title
 * @param {string} description - Activity description
 */
function addActivity(title, description) {
    const config = loadConfiguration();
    const activity = {
        timestamp: new Date().toISOString(),
        title: title,
        description: description
    };
    
    config.recentActivity.unshift(activity);
    
    // Keep only last 10 activities
    if (config.recentActivity.length > 10) {
        config.recentActivity = config.recentActivity.slice(0, 10);
    }
    
    saveConfiguration(config);
}

/**
 * Archive current index.html with timestamp
 */
function archiveCurrentVersion() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `index_${timestamp}.html`;
    
    addActivity('Documentation Archived', `Created archive: ${filename}`);
    
    // In actual implementation, this would use Desktop Commander to copy the file
    console.log(`Archive created: ${filename}`);
}

/**
 * Export configuration as JSON file
 * @returns {Blob} Configuration data as blob
 */
function exportConfigAsJSON() {
    const config = loadConfiguration();
    const dataStr = JSON.stringify(config, null, 2);
    return new Blob([dataStr], {type: 'application/json'});
}

/**
 * Import configuration from JSON
 * @param {string} jsonString - JSON configuration string
 * @returns {boolean} Success status
 */
function importConfigFromJSON(jsonString) {
    try {
        const config = JSON.parse(jsonString);
        
        // Validate configuration structure
        if (!config.version || !config.claude || !config.designSystem) {
            throw new Error('Invalid configuration format');
        }
        
        saveConfiguration(config);
        addActivity('Configuration Imported', 'Configuration restored from backup');
        return true;
    } catch (error) {
        console.error('Error importing configuration:', error);
        return false;
    }
}

/**
 * Generate CLAUDE.md content from configuration
 * @returns {string} Generated CLAUDE.md content
 */
function generateClaudeMDContent() {
    const config = loadConfiguration();
    
    if (!config.claude || !config.claude.sections || config.claude.sections.length === 0) {
        return null;
    }
    
    let content = '# CLAUDE.md - Zack\'s Claude Configuration\n\n';
    content += '<!-- Generated by Claude Control Center -->\n';
    content += `<!-- Generated: ${new Date().toISOString()} -->\n`;
    content += `<!-- Version: ${config.version} -->\n\n`;
    
    content += '---\n\n';
    
    config.claude.sections.forEach(section => {
        content += `## ${section.title}\n\n`;
        content += `${section.content}\n\n`;
        
        if (section.subsections && section.subsections.length > 0) {
            section.subsections.forEach(subsection => {
                content += `### ${subsection.title}\n\n`;
                content += `${subsection.content}\n\n`;
            });
        }
        
        content += '---\n\n';
    });
    
    // Add metadata footer
    content += '\n---\n\n';
    content += '**Configuration Details:**\n';
    content += `- Total Sections: ${config.claude.sections.length}\n`;
    content += `- Character Count: ${config.claude.characterCount}\n`;
    content += `- Last Updated: ${config.claude.lastUpdate}\n`;
    content += `- Skills Available: ${config.skills.length}\n`;
    content += `- Agents Defined: ${config.agents.length}\n`;
    content += `- Project Templates: ${config.templates.length}\n`;
    
    return content;
}

/**
 * Update CLAUDE.md configuration
 * @param {Array} sections - Array of section objects
 */
function updateClaudeMD(sections) {
    const config = loadConfiguration();
    
    // Calculate total character count
    let charCount = 0;
    sections.forEach(section => {
        charCount += section.content.length;
        if (section.subsections) {
            section.subsections.forEach(sub => {
                charCount += sub.content.length;
            });
        }
    });
    
    config.claude = {
        sections: sections,
        lastUpdate: new Date().toISOString(),
        characterCount: charCount
    };
    
    saveConfiguration(config);
    addActivity('CLAUDE.md Updated', `${sections.length} sections, ${charCount} characters`);
}

/**
 * Get stats for dashboard
 * @returns {Object} Statistics object
 */
function getStats() {
    const config = loadConfiguration();
    
    return {
        skills: config.skills.length,
        mcps: 27, // From Zack's system
        agents: config.agents.length,
        templates: config.templates.length,
        claudeSections: config.claude.sections.length,
        claudeChars: config.claude.characterCount,
        lastUpdate: config.lastModified
    };
}

/**
 * Format date for display
 * @param {string} isoDate - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(isoDate) {
    if (!isoDate) return 'Never';
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Initialize configuration if not exists or if sections are empty
 */
function initializeConfiguration() {
    let config = loadConfiguration();
    let needsSave = false;
    
    // Check if this is first time initialization
    if (!config.version) {
        config = { ...DEFAULT_CONFIG };
        needsSave = true;
        addActivity('System Initialized', 'Claude Control Center created');
    }
    
    // Check if sections need to be populated
    if (!config.claude || !config.claude.sections || config.claude.sections.length === 0) {
        if (!config.claude) config.claude = {};
        config.claude.sections = DEFAULT_CONFIG.claude.sections;
        config.claude.lastUpdate = new Date().toISOString();
        config.claude.characterCount = DEFAULT_CONFIG.claude.characterCount;
        needsSave = true;
        addActivity('Sections Initialized', 'Default configuration sections loaded');
    }
    
    if (needsSave) {
        saveConfiguration(config);
    }
}

// Initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeConfiguration();
    });
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadConfiguration,
        saveConfiguration,
        addActivity,
        archiveCurrentVersion,
        exportConfigAsJSON,
        importConfigFromJSON,
        generateClaudeMDContent,
        updateClaudeMD,
        getStats,
        formatDate
    };
}
