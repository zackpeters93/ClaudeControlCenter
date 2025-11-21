/**
 * Skills Library Management
 * Manages Claude Skills (markdown-based prompt templates)
 */

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let allSkills = [];
let filteredSkills = [];
let currentSkill = null;
let markdownEditor = null;

// Active filters
let activeFilters = {
    category: 'all',
    source: 'all',
    search: '',
    favoritesOnly: false
};

// Available categories for Skills
const SKILL_CATEGORIES = [
    'research', 'coding', 'writing', 'analysis', 'planning',
    'debugging', 'documentation', 'testing', 'review', 'other'
];

// Available sources
const SKILL_SOURCES = [
    'manual', 'anthropic', 'community', 'imported'
];

// Category icons mapping
const CATEGORY_ICONS = {
    'research': 'fa-search',
    'coding': 'fa-code',
    'writing': 'fa-pen',
    'analysis': 'fa-chart-line',
    'planning': 'fa-sitemap',
    'debugging': 'fa-bug',
    'documentation': 'fa-book',
    'testing': 'fa-vial',
    'review': 'fa-eye',
    'other': 'fa-file-alt'
};

// Source colors mapping
const SOURCE_COLORS = {
    'anthropic': '#0984e3',
    'community': '#00b894',
    'manual': '#6c5ce7',
    'imported': '#fdcb6e'
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Skills Library initializing...');

    try {
        await loadSkillsFromAPI();
        renderCategoryFilters();
        renderSourceFilters();
        renderSkills();
        updateStats();

        console.log(`Loaded ${allSkills.length} skills`);
    } catch (error) {
        console.error('Error initializing Skills Library:', error);
        showToast('Error loading skills', 'danger');
    }
});

// ============================================================================
// API CALLS
// ============================================================================

async function loadSkillsFromAPI() {
    try {
        const response = await api.skills.getAll();

        if (response.success) {
            allSkills = response.data;
            filteredSkills = [...allSkills];
            console.log('Skills loaded successfully:', allSkills.length);
        } else {
            throw new Error(response.message || 'Failed to load skills');
        }
    } catch (error) {
        console.error('Error loading skills:', error);
        showToast('Failed to load skills: ' + error.message, 'danger');
        allSkills = [];
        filteredSkills = [];
    }
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

function renderSkills() {
    const grid = document.getElementById('skillsGrid');

    if (filteredSkills.length === 0) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="card text-center py-5">
                    <div class="card-body">
                        <i class="fas fa-wand-magic-sparkles" style="font-size: 4rem; color: #dfe6e9; margin-bottom: 20px;"></i>
                        <h3>No Skills Found</h3>
                        <p class="text-muted">Try adjusting your filters or create a new skill.</p>
                        <button class="btn" style="background-color: #00b894; color: white;" onclick="showCreateSkillModal()">
                            <i class="fas fa-plus"></i> Create Skill
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredSkills.map(skill => createSkillCard(skill)).join('');
}

function createSkillCard(skill) {
    const icon = skill.icon || CATEGORY_ICONS[skill.category] || 'fa-file-alt';
    const color = skill.color || SOURCE_COLORS[skill.source] || '#0984e3';
    const sourceClass = `source-${skill.source}`;
    const favoriteClass = skill.isFavorite ? 'active' : '';

    // Parse tags
    const tags = Array.isArray(skill.tags) ? skill.tags : [];
    const tagBadges = tags.slice(0, 3).map(tag =>
        `<span class="badge tag-badge" style="background-color: #dfe6e9; color: #2d3436;">${tag}</span>`
    ).join('');

    return `
        <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
            <div class="card skill-card ${sourceClass}" onclick="showSkillDetail('${skill.id}')">
                <i class="fas fa-star favorite-star ${favoriteClass}"
                   onclick="event.stopPropagation(); toggleFavorite('${skill.id}')"
                   title="${skill.isFavorite ? 'Remove from favorites' : 'Add to favorites'}"></i>

                <div class="card-body">
                    <div class="text-center skill-icon" style="color: ${color};">
                        <i class="fas ${icon}"></i>
                    </div>

                    <h5 class="card-title text-center mb-3">${skill.name}</h5>

                    <p class="card-text text-muted small mb-3">${skill.description}</p>

                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge category-badge" style="background-color: ${color}; color: white;">
                            ${skill.category}
                        </span>
                        <span class="badge" style="background-color: ${SOURCE_COLORS[skill.source]}; color: white;">
                            ${skill.source}
                        </span>
                    </div>

                    ${tags.length > 0 ? `
                        <div class="mb-2">
                            ${tagBadges}
                            ${tags.length > 3 ? `<span class="small text-muted">+${tags.length - 3} more</span>` : ''}
                        </div>
                    ` : ''}

                    <div class="text-center mt-3">
                        <small class="text-muted">
                            <i class="fas fa-eye"></i> Used ${skill.usageCount || 0} times
                        </small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCategoryFilters() {
    const container = document.getElementById('categoryFilters');

    // Get unique categories from skills
    const categories = ['all', ...new Set(allSkills.map(s => s.category))];

    container.innerHTML = categories.map(cat => {
        const active = activeFilters.category === cat ? 'active' : '';
        const label = cat.charAt(0).toUpperCase() + cat.slice(1);
        return `
            <button class="btn btn-sm filter-btn ${active}" onclick="filterByCategory('${cat}')">
                ${label}
            </button>
        `;
    }).join('');
}

function renderSourceFilters() {
    const container = document.getElementById('sourceFilters');

    // Get unique sources from skills
    const sources = ['all', ...new Set(allSkills.map(s => s.source))];

    container.innerHTML = sources.map(source => {
        const active = activeFilters.source === source ? 'active' : '';
        const label = source.charAt(0).toUpperCase() + source.slice(1);
        return `
            <button class="btn btn-sm filter-btn ${active}" onclick="filterBySource('${source}')">
                ${label}
            </button>
        `;
    }).join('');
}

// ============================================================================
// FILTER FUNCTIONS
// ============================================================================

function filterByCategory(category) {
    activeFilters.category = category;
    applyFilters();
}

function filterBySource(source) {
    activeFilters.source = source;
    applyFilters();
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    activeFilters.search = searchInput.value.toLowerCase();
    applyFilters();
}

function toggleFavoritesOnly() {
    activeFilters.favoritesOnly = !activeFilters.favoritesOnly;
    const btnText = document.getElementById('favBtnText');
    btnText.textContent = activeFilters.favoritesOnly ? 'Show All' : 'Show Favorites';
    applyFilters();
}

function applyFilters() {
    filteredSkills = allSkills.filter(skill => {
        // Category filter
        if (activeFilters.category !== 'all' && skill.category !== activeFilters.category) {
            return false;
        }

        // Source filter
        if (activeFilters.source !== 'all' && skill.source !== activeFilters.source) {
            return false;
        }

        // Favorites filter
        if (activeFilters.favoritesOnly && !skill.isFavorite) {
            return false;
        }

        // Search filter
        if (activeFilters.search) {
            const searchStr = activeFilters.search;
            const nameMatch = skill.name.toLowerCase().includes(searchStr);
            const descMatch = skill.description.toLowerCase().includes(searchStr);
            const contentMatch = skill.content && skill.content.toLowerCase().includes(searchStr);
            const tagsMatch = Array.isArray(skill.tags) &&
                skill.tags.some(tag => tag.toLowerCase().includes(searchStr));

            if (!nameMatch && !descMatch && !contentMatch && !tagsMatch) {
                return false;
            }
        }

        return true;
    });

    renderSkills();
    renderCategoryFilters();
    renderSourceFilters();
    updateStats();
}

// ============================================================================
// STATS FUNCTIONS
// ============================================================================

function updateStats() {
    document.getElementById('totalCount').textContent = allSkills.length;
    document.getElementById('publishedCount').textContent =
        allSkills.filter(s => s.source === 'anthropic' || s.source === 'community').length;
    document.getElementById('favoriteCount').textContent =
        allSkills.filter(s => s.isFavorite).length;
    document.getElementById('filteredCount').textContent = filteredSkills.length;
}

// ============================================================================
// MODAL FUNCTIONS
// ============================================================================

async function showSkillDetail(skillId) {
    const skill = allSkills.find(s => s.id === skillId);
    if (!skill) return;

    currentSkill = skill;

    // Increment usage count
    try {
        await api.skills.incrementUsage(skillId);
        skill.usageCount = (skill.usageCount || 0) + 1;
        updateStats();
    } catch (error) {
        console.error('Error incrementing usage:', error);
    }

    const modal = new bootstrap.Modal(document.getElementById('skillDetailModal'));
    document.getElementById('modalSkillName').textContent = skill.name;

    // Parse tags
    const tags = Array.isArray(skill.tags) ? skill.tags : [];
    const tagBadges = tags.map(tag =>
        `<span class="badge" style="background-color: #dfe6e9; color: #2d3436; margin-right: 5px;">${tag}</span>`
    ).join('');

    // Render markdown content
    const renderedContent = skill.content ? marked.parse(skill.content) : 'No content';

    document.getElementById('modalSkillContent').innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <h6>Description:</h6>
                <p>${skill.description}</p>

                <h6 class="mt-3">Content:</h6>
                <div class="markdown-preview">
                    ${renderedContent}
                </div>

                ${skill.whenToUse ? `
                    <h6 class="mt-3">When to Use:</h6>
                    <p>${skill.whenToUse}</p>
                ` : ''}
            </div>

            <div class="col-md-4">
                <h6>Details:</h6>
                <table class="table table-sm">
                    <tr>
                        <th>Category:</th>
                        <td><span class="badge" style="background-color: ${skill.color}; color: white;">${skill.category}</span></td>
                    </tr>
                    <tr>
                        <th>Source:</th>
                        <td><span class="badge" style="background-color: ${SOURCE_COLORS[skill.source]}; color: white;">${skill.source}</span></td>
                    </tr>
                    <tr>
                        <th>Slug:</th>
                        <td><code>${skill.slug}</code></td>
                    </tr>
                    <tr>
                        <th>Tags:</th>
                        <td>${tagBadges || 'None'}</td>
                    </tr>
                    <tr>
                        <th>Usage:</th>
                        <td>${skill.usageCount || 0} times</td>
                    </tr>
                    <tr>
                        <th>Created:</th>
                        <td>${new Date(skill.createdAt).toLocaleDateString()}</td>
                    </tr>
                    ${skill.sourceUrl ? `
                        <tr>
                            <th>Source URL:</th>
                            <td><a href="${skill.sourceUrl}" target="_blank">GitHub</a></td>
                        </tr>
                    ` : ''}
                </table>
            </div>
        </div>
    `;

    modal.show();
}

function showCreateSkillModal() {
    const fields = [
        {
            name: 'name',
            label: 'Skill Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Web Research, Code Review'
        },
        {
            name: 'slug',
            label: 'Slug (URL-friendly)',
            type: 'text',
            required: true,
            placeholder: 'e.g., web-research, code-review'
        },
        {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            required: true,
            placeholder: 'Brief description of what this skill does'
        },
        {
            name: 'category',
            label: 'Category',
            type: 'select',
            required: true,
            options: SKILL_CATEGORIES.map(cat => ({
                value: cat,
                label: cat.charAt(0).toUpperCase() + cat.slice(1)
            }))
        },
        {
            name: 'tags',
            label: 'Tags (comma-separated)',
            type: 'text',
            required: false,
            placeholder: 'e.g., research, web, analysis'
        },
        {
            name: 'source',
            label: 'Source',
            type: 'select',
            required: true,
            options: SKILL_SOURCES.map(src => ({
                value: src,
                label: src.charAt(0).toUpperCase() + src.slice(1)
            }))
        },
        {
            name: 'sourceUrl',
            label: 'Source URL (optional)',
            type: 'text',
            required: false,
            placeholder: 'https://github.com/...'
        },
        {
            name: 'whenToUse',
            label: 'When to Use (optional)',
            type: 'textarea',
            required: false,
            placeholder: 'Guidelines for when to apply this skill'
        }
    ];

    showFormModal({
        title: 'Create New Skill',
        size: 'modal-xl',
        fields: fields,
        submitText: 'Next: Add Content',
        onSubmit: async (formData) => {
            // Show markdown editor modal next
            showMarkdownEditorModal(formData);
        }
    });
}

function showMarkdownEditorModal(skillData) {
    const modalHtml = `
        <div class="modal fade" id="markdownEditorModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header" style="background-color: #6c5ce7; color: white;">
                        <h5 class="modal-title">Add Skill Content (Markdown)</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="text-muted">Write the skill content in Markdown format. This will be the prompt template that Claude uses.</p>
                        <textarea id="skillMarkdownEditor"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-success" onclick="saveSkillWithContent()">
                            <i class="fas fa-save"></i> Create Skill
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing markdown editor modal if present
    const existingModal = document.getElementById('markdownEditorModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Initialize SimpleMDE
    const modal = new bootstrap.Modal(document.getElementById('markdownEditorModal'));
    modal.show();

    // Wait for modal to show, then initialize editor
    setTimeout(() => {
        markdownEditor = new SimpleMDE({
            element: document.getElementById('skillMarkdownEditor'),
            spellChecker: false,
            placeholder: "# Skill Name\n\n## Description\nDescribe what this skill does...\n\n## Instructions\n1. Step one\n2. Step two\n\n## Example\n```\nExample code or usage\n```",
            minHeight: "400px",
            toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|",
                      "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"],
            status: ["lines", "words", "cursor"]
        });

        // Store skill data for later
        window.currentSkillData = skillData;
    }, 300);
}

async function saveSkillWithContent() {
    const skillData = window.currentSkillData;
    const content = markdownEditor.value();

    if (!content.trim()) {
        showToast('Please add content for the skill', 'warning');
        return;
    }

    // Parse tags
    const tags = skillData.tags ?
        skillData.tags.split(',').map(t => t.trim()).filter(t => t) :
        [];

    const payload = {
        ...skillData,
        content: content,
        tags: tags
    };

    try {
        const response = await api.skills.create(payload);

        if (response.success) {
            showToast('Skill created successfully!', 'success');

            // Close modals
            bootstrap.Modal.getInstance(document.getElementById('markdownEditorModal')).hide();

            // Reload skills
            await loadSkillsFromAPI();
            applyFilters();

            // Clean up
            window.currentSkillData = null;
            markdownEditor = null;
        } else {
            throw new Error(response.message || 'Failed to create skill');
        }
    } catch (error) {
        console.error('Error creating skill:', error);
        showToast('Error creating skill: ' + error.message, 'danger');
    }
}

async function editCurrentSkill() {
    if (!currentSkill) return;

    // Close detail modal
    bootstrap.Modal.getInstance(document.getElementById('skillDetailModal')).hide();

    // Define fields (without values)
    const fields = [
        {
            name: 'name',
            label: 'Skill Name',
            type: 'text',
            required: true
        },
        {
            name: 'slug',
            label: 'Slug (URL-friendly)',
            type: 'text',
            required: true
        },
        {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            required: true
        },
        {
            name: 'category',
            label: 'Category',
            type: 'select',
            required: true,
            options: SKILL_CATEGORIES.map(cat => ({
                value: cat,
                label: cat.charAt(0).toUpperCase() + cat.slice(1)
            }))
        },
        {
            name: 'tags',
            label: 'Tags (comma-separated)',
            type: 'text',
            required: false
        },
        {
            name: 'source',
            label: 'Source',
            type: 'select',
            required: true,
            options: SKILL_SOURCES.map(src => ({
                value: src,
                label: src.charAt(0).toUpperCase() + src.slice(1)
            }))
        },
        {
            name: 'sourceUrl',
            label: 'Source URL (optional)',
            type: 'text',
            required: false
        },
        {
            name: 'whenToUse',
            label: 'When to Use (optional)',
            type: 'textarea',
            required: false
        }
    ];

    // Prepare data object with current values
    const data = {
        name: currentSkill.name,
        slug: currentSkill.slug,
        description: currentSkill.description,
        category: currentSkill.category,
        tags: Array.isArray(currentSkill.tags) ? currentSkill.tags.join(', ') : '',
        source: currentSkill.source,
        sourceUrl: currentSkill.sourceUrl || '',
        whenToUse: currentSkill.whenToUse || ''
    };

    showFormModal({
        title: 'Edit Skill',
        size: 'modal-xl',
        fields: fields,
        data: data,
        submitText: 'Next: Edit Content',
        onSubmit: async (formData) => {
            showMarkdownEditorModalForEdit(formData, currentSkill);
        }
    });
}

function showMarkdownEditorModalForEdit(skillData, originalSkill) {
    const modalHtml = `
        <div class="modal fade" id="markdownEditorModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header" style="background-color: #6c5ce7; color: white;">
                        <h5 class="modal-title">Edit Skill Content (Markdown)</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <textarea id="skillMarkdownEditor"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="updateSkillWithContent()">
                            <i class="fas fa-save"></i> Update Skill
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('markdownEditorModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = new bootstrap.Modal(document.getElementById('markdownEditorModal'));
    modal.show();

    setTimeout(() => {
        markdownEditor = new SimpleMDE({
            element: document.getElementById('skillMarkdownEditor'),
            spellChecker: false,
            initialValue: originalSkill.content || '',
            minHeight: "400px",
            toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|",
                      "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"],
            status: ["lines", "words", "cursor"]
        });

        window.currentSkillData = { ...skillData, id: originalSkill.id };
    }, 300);
}

async function updateSkillWithContent() {
    const skillData = window.currentSkillData;
    const content = markdownEditor.value();

    const tags = skillData.tags ?
        skillData.tags.split(',').map(t => t.trim()).filter(t => t) :
        [];

    const payload = {
        ...skillData,
        content: content,
        tags: tags
    };

    try {
        const response = await api.skills.update(skillData.id, payload);

        if (response.success) {
            showToast('Skill updated successfully!', 'success');

            bootstrap.Modal.getInstance(document.getElementById('markdownEditorModal')).hide();

            await loadSkillsFromAPI();
            applyFilters();

            window.currentSkillData = null;
            markdownEditor = null;
        } else {
            throw new Error(response.message || 'Failed to update skill');
        }
    } catch (error) {
        console.error('Error updating skill:', error);
        showToast('Error updating skill: ' + error.message, 'danger');
    }
}

async function deleteCurrentSkill() {
    if (!currentSkill) return;

    if (!confirm(`Are you sure you want to delete "${currentSkill.name}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await api.skills.delete(currentSkill.id);

        if (response.success) {
            showToast('Skill deleted successfully', 'success');

            bootstrap.Modal.getInstance(document.getElementById('skillDetailModal')).hide();

            await loadSkillsFromAPI();
            applyFilters();

            currentSkill = null;
        } else {
            throw new Error(response.message || 'Failed to delete skill');
        }
    } catch (error) {
        console.error('Error deleting skill:', error);
        showToast('Error deleting skill: ' + error.message, 'danger');
    }
}

async function toggleFavorite(skillId) {
    const skill = allSkills.find(s => s.id === skillId);
    if (!skill) return;

    try {
        const response = await api.skills.update(skillId, {
            isFavorite: !skill.isFavorite
        });

        if (response.success) {
            skill.isFavorite = !skill.isFavorite;
            renderSkills();
            updateStats();
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showToast('Error updating favorite status', 'danger');
    }
}

function exportCurrentSkill() {
    if (!currentSkill) return;

    // Create markdown file content
    const markdownContent = currentSkill.content;

    // Create download
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSkill.slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Exported ${currentSkill.name} to ${currentSkill.slug}.md`, 'success');
}

function showImportAnthropicModal() {
    showToast('Import from Anthropic repository coming soon!', 'info');
    // This will be implemented in the backend import script
}
