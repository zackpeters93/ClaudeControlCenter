/**
 * Claude Builder - JavaScript
 * Handles CLAUDE.md section editing and management
 */

let currentSectionId = null;
let autoSaveTimeout = null;

// Template definitions based on research
const SECTION_TEMPLATES = [
    {
        id: 'critical-rules',
        title: 'Critical Rules Template',
        icon: 'fa-ban',
        color: '#d63031',
        content: `**Documentation & Files:**
- ❌ NEVER use markdown files (.md) for project documentation
- ✅ ALWAYS use HTML files with Bootstrap styling
- ✅ ALWAYS use the American Palette color scheme
- ❌ NEVER use gradients - ALWAYS flat design only
- ✅ ALWAYS archive previous versions with timestamps

**Project Management:**
- ✅ ALWAYS ask "Do you want me to create a Project?" first
- ✅ ALWAYS create new directories in /Users/techdev/Projects/ClaudeDC/
- ✅ ALWAYS use Sequential-Thinking for complex planning

**Tool Usage:**
- ✅ ALWAYS use Desktop Commander for file operations
- ✅ ALWAYS use proper MCP tool formats
- ❌ NEVER use placeholder formats like [tool: query]`
    },
    {
        id: 'decision-tree',
        title: 'Decision Tree Template',
        icon: 'fa-sitemap',
        color: '#0984e3',
        content: `**Information Currency Check:**
\`\`\`
IF information is timeless (fundamental concepts)
  → Answer directly without searching
ELSE IF information changes slowly (annual statistics)
  → Answer first, THEN offer to search
ELSE IF information is current/live (prices, news)
  → Search immediately before answering
\`\`\`

**Tool Selection Logic:**
\`\`\`
IF task involves local files
  → Use Desktop Commander + start_process
ELSE IF task involves current events
  → Use web_search
ELSE IF task involves code repository
  → Use GitHub MCP
ELSE IF task involves Google Docs
  → Use google_drive_search
\`\`\``
    },
    {
        id: 'tool-priority',
        title: 'Tool Priority Template',
        icon: 'fa-layer-group',
        color: '#00b894',
        content: `**Tool Usage Priority Order:**

1. **Desktop Commander** (Critical)
   - File operations (read, write, create, move)
   - Terminal commands and processes
   - Local data analysis

2. **Sequential-Thinking** (High)
   - Complex project planning
   - Multi-step problem solving
   - Architecture decisions

3. **Context7** (High)
   - Latest documentation retrieval
   - SDK and API references

4. **Web Search** (Medium)
   - Current events and news
   - Real-time data verification

5. **Specialized MCPs** (As Needed)
   - GitHub for repositories
   - Google Drive for documents
   - Memory for context retention`
    },
    {
        id: 'anti-patterns',
        title: 'Anti-Patterns Template',
        icon: 'fa-times-circle',
        color: '#d63031',
        content: `**What NOT to Do:**

❌ **NEVER** use gradients in design
❌ **NEVER** create markdown files for projects
❌ **NEVER** overwrite files without archiving
❌ **NEVER** assume user intent - always clarify
❌ **NEVER** use placeholder tool formats
❌ **NEVER** reproduce copyrighted material
❌ **NEVER** quote song lyrics (even in artifacts)

**Common Mistakes to Avoid:**
- Creating single-use solutions instead of distributable tools
- Jumping to code without planning
- Using analysis tool for local files (use processes instead)
- Forgetting to ask about Project website creation
- Not checking knowledge cutoff for time-sensitive info`
    },
    {
        id: 'context-specific',
        title: 'Context-Specific Template',
        icon: 'fa-desktop',
        color: '#0984e3',
        content: `**When in Claude Desktop:**
- Full MCP access (27+ tools)
- Use Desktop Commander extensively
- Can create files and directories
- Can execute terminal commands
- Cross-machine sync via GitHub

**When in Claude Code:**
- Terminal-focused workflow
- Git integration preferred
- Code-first approach
- Use process tools heavily

**When in Web Interface:**
- Limited to web-based tools
- Focus on analysis and planning
- Use web search more frequently
- Cannot access local files`
    },
    {
        id: '90-10-rule',
        title: '90/10 Prevention Template',
        icon: 'fa-shield-alt',
        color: '#fdcb6e',
        content: `**Prevention Over Instruction (90/10 Rule):**

Focus 90% on what NOT to do, 10% on what to do.

**Safety Boundaries:**
- Define clear limits and constraints
- Specify failure modes and how to handle them
- Establish red lines that cannot be crossed

**Common Failure Modes:**
- Using wrong tool for the task
- Not preserving file history
- Creating non-distributable solutions
- Ignoring design system requirements
- Skipping validation steps

**Counter-Examples:**
❌ Bad: "Be concise"
✅ Good: "Responses must be under 500 words"

❌ Bad: "Try to use American Palette"  
✅ Good: "ALWAYS use American Palette - no exceptions"`
    }
];

/**
 * Initialize the builder on page load
 */
function initBuilder() {
    loadAllSections();
    populateTemplates();
    updateStats();
    
    // Setup auto-save for content textarea
    const contentTextarea = document.getElementById('contentTextarea');
    if (contentTextarea) {
        contentTextarea.addEventListener('input', () => {
            updateCharCounter();
            scheduleAutoSave();
        });
    }
    
    // Setup title input auto-save
    const titleInput = document.getElementById('sectionTitleInput');
    if (titleInput) {
        titleInput.addEventListener('input', scheduleAutoSave);
    }
}

/**
 * Load all sections from configuration
 */
function loadAllSections() {
    const config = loadConfiguration();
    const sections = config.claude?.sections || [];
    
    const sectionList = document.getElementById('sectionList');
    sectionList.innerHTML = '';
    
    if (sections.length === 0) {
        sectionList.innerHTML = '<div class="text-center text-muted p-3"><small>No sections yet. Click + to add one.</small></div>';
        return;
    }
    
    sections.forEach(section => {
        const sectionItem = createSectionListItem(section);
        sectionList.appendChild(sectionItem);
    });
}

/**
 * Create a section list item element
 */
function createSectionListItem(section) {
    const div = document.createElement('div');
    div.className = `section-item priority-${section.priority || 2}`;
    if (!section.enabled) div.classList.add('disabled');
    div.onclick = () => selectSection(section.id);
    
    const title = document.createElement('div');
    title.innerHTML = `
        <strong>${section.title}</strong>
        <div class="small text-muted mt-1">
            ${section.context ? section.context.join(', ') : 'all'}
        </div>
    `;
    
    div.appendChild(title);
    return div;
}
/**
 * Select and load a section into the editor
 */
function selectSection(sectionId) {
    currentSectionId = sectionId;
    
    const config = loadConfiguration();
    const section = config.claude?.sections?.find(s => s.id === sectionId);
    
    if (!section) return;
    
    // Update UI
    document.querySelectorAll('.section-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.section-item').classList.add('active');
    
    // Show editor form
    document.getElementById('editorContent').style.display = 'none';
    document.getElementById('editorForm').style.display = 'block';
    document.getElementById('editorTitle').textContent = section.title;
    
    // Populate form
    document.getElementById('sectionTitleInput').value = section.title;
    document.getElementById('contentTextarea').value = section.content || '';
    document.getElementById('prioritySelect').value = section.priority || 2;
    document.getElementById('enabledSwitch').checked = section.enabled !== false;
    
    // Set context checkboxes
    const contexts = section.context || ['all'];
    document.getElementById('contextAll').checked = contexts.includes('all');
    document.getElementById('contextDesktop').checked = contexts.includes('desktop');
    document.getElementById('contextCode').checked = contexts.includes('code');
    document.getElementById('contextWeb').checked = contexts.includes('web');
    
    updateCharCounter();
}

/**
 * Save current section
 */
function saveCurrentSection() {
    if (!currentSectionId) return;
    
    const config = loadConfiguration();
    const sectionIndex = config.claude.sections.findIndex(s => s.id === currentSectionId);
    
    if (sectionIndex === -1) return;
    
    // Get form values
    const title = document.getElementById('sectionTitleInput').value;
    const content = document.getElementById('contentTextarea').value;
    const priority = parseInt(document.getElementById('prioritySelect').value);
    const enabled = document.getElementById('enabledSwitch').checked;
    
    // Get selected contexts
    const contexts = [];
    if (document.getElementById('contextAll').checked) contexts.push('all');
    if (document.getElementById('contextDesktop').checked) contexts.push('desktop');
    if (document.getElementById('contextCode').checked) contexts.push('code');
    if (document.getElementById('contextWeb').checked) contexts.push('web');
    
    // Update section
    config.claude.sections[sectionIndex] = {
        ...config.claude.sections[sectionIndex],
        title,
        content,
        priority,
        enabled,
        context: contexts
    };
    
    // Update character count
    let totalChars = 0;
    config.claude.sections.forEach(s => totalChars += (s.content || '').length);
    config.claude.characterCount = totalChars;
    config.claude.lastUpdate = new Date().toISOString();
    
    saveConfiguration(config);
    loadAllSections();
    updateStats();
    showToast('Section saved successfully!', 'success');
    
    // Update last saved time
    document.getElementById('lastSaved').textContent = 'Just now';
}

/**
 * Delete current section
 */
function deleteCurrentSection() {
    if (!currentSectionId) return;
    
    if (!confirm('Are you sure you want to delete this section?')) return;
    
    const config = loadConfiguration();
    config.claude.sections = config.claude.sections.filter(s => s.id !== currentSectionId);
    
    saveConfiguration(config);
    
    currentSectionId = null;
    document.getElementById('editorContent').style.display = 'block';
    document.getElementById('editorForm').style.display = 'none';
    
    loadAllSections();
    updateStats();
    showToast('Section deleted', 'info');
}

/**
 * Add new section
 */
function addNewSection() {
    const config = loadConfiguration();
    if (!config.claude.sections) config.claude.sections = [];
    
    const newId = 'section-' + Date.now();
    const newSection = {
        id: newId,
        title: 'New Section',
        content: '',
        enabled: true,
        context: ['all'],
        priority: 2
    };
    
    config.claude.sections.push(newSection);
    saveConfiguration(config);
    
    loadAllSections();
    updateStats();
    selectSection(newId);
    
    showToast('New section created', 'success');
}

/**
 * Toggle section enabled status
 */
function toggleSectionEnabled() {
    scheduleAutoSave();
}

/**
 * Handle context checkbox changes
 */
function handleContextChange() {
    const allChecked = document.getElementById('contextAll').checked;
    
    if (allChecked) {
        document.getElementById('contextDesktop').checked = false;
        document.getElementById('contextCode').checked = false;
        document.getElementById('contextWeb').checked = false;
    }
    
    scheduleAutoSave();
}

/**
 * Clear content
 */
function clearContent() {
    if (!confirm('Clear all content in this section?')) return;
    
    document.getElementById('contentTextarea').value = '';
    updateCharCounter();
    scheduleAutoSave();
}

/**
 * Update character counter
 */
function updateCharCounter() {
    const content = document.getElementById('contentTextarea').value;
    const length = content.length;
    const counter = document.getElementById('charCounter');
    
    counter.textContent = `${length} characters`;
    
    counter.className = 'char-counter';
    if (length > 8000) {
        counter.classList.add('danger');
    } else if (length > 5000) {
        counter.classList.add('warning');
    }
}

/**
 * Schedule auto-save
 */
function scheduleAutoSave() {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    
    autoSaveTimeout = setTimeout(() => {
        if (currentSectionId) {
            saveCurrentSection();
        }
    }, 2000); // Save 2 seconds after user stops typing
}

/**
 * Update statistics
 */
function updateStats() {
    const config = loadConfiguration();
    const sections = config.claude?.sections || [];
    
    const enabled = sections.filter(s => s.enabled !== false).length;
    let totalChars = 0;
    sections.forEach(s => totalChars += (s.content || '').length);
    
    document.getElementById('sectionCount').textContent = sections.length;
    document.getElementById('enabledCount').textContent = enabled;
    document.getElementById('totalChars').textContent = totalChars.toLocaleString();
    
    if (config.claude?.lastUpdate) {
        const date = new Date(config.claude.lastUpdate);
        document.getElementById('lastSaved').textContent = formatDate(config.claude.lastUpdate);
    }
}

/**
 * Populate template list
 */
function populateTemplates() {
    const templateList = document.getElementById('templateList');
    templateList.innerHTML = '';
    
    SECTION_TEMPLATES.forEach(template => {
        const card = document.createElement('div');
        card.className = 'card template-card mb-2';
        card.style.borderLeft = `4px solid ${template.color}`;
        card.onclick = () => insertTemplate(template);
        
        card.innerHTML = `
            <div class="card-body p-2">
                <small>
                    <i class="fas ${template.icon}" style="color: ${template.color};"></i>
                    <strong>${template.title}</strong>
                </small>
            </div>
        `;
        
        templateList.appendChild(card);
    });
}

/**
 * Insert template content
 */
function insertTemplate(template) {
    const textarea = document.getElementById('contentTextarea');
    const currentContent = textarea.value;
    
    if (currentContent && !confirm('This will replace current content. Continue?')) {
        return;
    }
    
    textarea.value = template.content;
    document.getElementById('sectionTitleInput').value = template.title.replace(' Template', '');
    
    updateCharCounter();
    scheduleAutoSave();
    showToast('Template inserted!', 'success');
}
/**
 * Preview CLAUDE.md
 */
function previewCLAUDEmd() {
    const content = generateClaudeMDContent();
    
    if (!content) {
        showToast('No sections configured yet!', 'warning');
        return;
    }
    
    document.getElementById('previewContent').textContent = content;
    
    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    modal.show();
}

/**
 * Export CLAUDE.md file
 */
function exportCLAUDEmd() {
    const content = generateClaudeMDContent();
    
    if (!content) {
        showToast('No sections configured yet!', 'warning');
        return;
    }
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'CLAUDE.md';
    link.click();
    
    addActivity('CLAUDE.md Exported', 'Downloaded CLAUDE.md configuration file');
    showToast('CLAUDE.md downloaded!', 'success');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const colors = {
        success: '#00b894',
        info: '#0984e3',
        warning: '#fdcb6e',
        danger: '#d63031'
    };
    
    const icons = {
        success: 'check-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle',
        danger: 'times-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.style.backgroundColor = colors[type];
    toast.style.color = 'white';
    toast.innerHTML = `
        <div class="toast-body d-flex align-items-center">
            <i class="fas fa-${icons[type]} me-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize when page loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initBuilder);
}
