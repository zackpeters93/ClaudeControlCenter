/**
 * Skills Manager - JavaScript (Phase 3: API-Connected CRUD)
 * Manages MCP Skills Library with search, filters, and full CRUD operations
 */

// State management
let allSkills = [];
let filteredSkills = [];
let activeFilters = {
    category: 'all',
    priority: 'all',
    search: '',
    favoritesOnly: false
};

/**
 * Initialize Skills Manager
 */
async function initSkillsManager() {
    await loadSkillsFromAPI();
    populateFilters();
    renderSkills();
    updateStats();
}

/**
 * Load skills from backend API
 */
async function loadSkillsFromAPI() {
    try {
        const response = await api.skills.getAll();
        if (response.success) {
            allSkills = response.data;
            filteredSkills = [...allSkills];
            console.log(`Loaded ${allSkills.length} skills from API`);
        } else {
            showToast('Failed to load skills', 'error');
        }
    } catch (error) {
        console.error('Error loading skills:', error);
        showToast('Error loading skills from server', 'error');
        allSkills = [];
        filteredSkills = [];
    }
}

/**
 * Show create skill modal
 */
function showCreateSkillModal() {
    const fields = [
        { name: 'name', label: 'Skill Name', type: 'text', required: true, placeholder: 'e.g., Desktop Commander' },
        { name: 'category', label: 'Category', type: 'text', required: true, placeholder: 'e.g., File Management' },
        {
            name: 'priority',
            label: 'Priority',
            type: 'select',
            required: true,
            options: [
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
            ]
        },
        { name: 'icon', label: 'Icon Class', type: 'text', required: true, placeholder: 'e.g., fa-terminal', default: 'fa-cube' },
        { name: 'color', label: 'Color', type: 'color', required: true, default: '#0984e3' },
        {
            name: 'availability',
            label: 'Availability',
            type: 'tags',
            required: true,
            placeholder: 'desktop, code, web',
            help: 'Separate with commas (e.g., desktop, code, web)'
        },
        {
            name: 'tools',
            label: 'Tools (JSON)',
            type: 'json',
            required: true,
            rows: 8,
            default: JSON.stringify([{ name: 'example_tool', description: 'Tool description' }], null, 2),
            help: 'Array of {name, description} objects'
        },
        {
            name: 'usageExamples',
            label: 'Usage Examples',
            type: 'tags',
            required: true,
            placeholder: 'Example 1, Example 2, Example 3',
            help: 'Separate examples with commas'
        },
        { name: 'documentation', label: 'Documentation URL', type: 'url', required: false, placeholder: 'https://...' }
    ];

    showFormModal({
        title: 'Create New Skill',
        fields: fields,
        submitText: 'Create Skill',
        onSubmit: async (data) => {
            await createSkill(data);
        }
    });
}

/**
 * Show edit skill modal
 */
function showEditSkillModal(skill) {
    const fields = [
        { name: 'name', label: 'Skill Name', type: 'text', required: true },
        { name: 'category', label: 'Category', type: 'text', required: true },
        {
            name: 'priority',
            label: 'Priority',
            type: 'select',
            required: true,
            options: [
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
            ]
        },
        { name: 'icon', label: 'Icon Class', type: 'text', required: true },
        { name: 'color', label: 'Color', type: 'color', required: true },
        {
            name: 'availability',
            label: 'Availability',
            type: 'tags',
            required: true,
            help: 'Separate with commas (e.g., desktop, code, web)'
        },
        {
            name: 'tools',
            label: 'Tools (JSON)',
            type: 'json',
            required: true,
            rows: 8,
            help: 'Array of {name, description} objects'
        },
        {
            name: 'usageExamples',
            label: 'Usage Examples',
            type: 'tags',
            required: true,
            help: 'Separate examples with commas'
        },
        { name: 'documentation', label: 'Documentation URL', type: 'url', required: false }
    ];

    showFormModal({
        title: `Edit Skill: ${skill.name}`,
        fields: fields,
        data: skill,
        submitText: 'Save Changes',
        onSubmit: async (data) => {
            await updateSkill(skill.id, data);
        }
    });
}

/**
 * Create new skill via API
 */
async function createSkill(data) {
    try {
        const response = await api.skills.create({
            ...data,
            source: 'manual'
        });

        if (response.success) {
            showToast('Skill created successfully', 'success');
            await loadSkillsFromAPI();
            populateFilters();
            applyFilters();
        }
    } catch (error) {
        console.error('Error creating skill:', error);
        showToast('Failed to create skill', 'error');
    }
}

/**
 * Update existing skill via API
 */
async function updateSkill(id, data) {
    try {
        const response = await api.skills.update(id, data);

        if (response.success) {
            showToast('Skill updated successfully', 'success');
            await loadSkillsFromAPI();
            applyFilters();
        }
    } catch (error) {
        console.error('Error updating skill:', error);
        showToast('Failed to update skill', 'error');
    }
}

/**
 * Delete skill with confirmation
 */
function deleteSkill(id, name) {
    showConfirm({
        title: 'Delete Skill',
        message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: '#d63031',
        onConfirm: async () => {
            try {
                const response = await api.skills.delete(id);

                if (response.success) {
                    showToast('Skill deleted successfully', 'success');
                    await loadSkillsFromAPI();
                    populateFilters();
                    applyFilters();
                }
            } catch (error) {
                console.error('Error deleting skill:', error);
                showToast('Failed to delete skill', 'error');
            }
        }
    });
}

/**
 * Populate filter buttons
 */
function populateFilters() {
    // Get unique categories from loaded skills
    const categories = ['all', ...new Set(allSkills.map(s => s.category))];
    const priorities = ['all', 'critical', 'high', 'medium', 'low'];

    // Category filters
    const categoryFilters = document.getElementById('categoryFilters');
    categoryFilters.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-outline-primary filter-btn' + (cat === 'all' ? ' active' : '');
        btn.textContent = cat === 'all' ? 'All' : cat;
        btn.onclick = () => filterByCategory(cat);
        categoryFilters.appendChild(btn);
    });

    // Priority filters
    const priorityFilters = document.getElementById('priorityFilters');
    priorityFilters.innerHTML = '';
    priorities.forEach(pri => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-outline-primary filter-btn' + (pri === 'all' ? ' active' : '');
        btn.textContent = pri.charAt(0).toUpperCase() + pri.slice(1);
        btn.onclick = () => filterByPriority(pri);
        priorityFilters.appendChild(btn);
    });
}

/**
 * Handle search input
 */
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    activeFilters.search = searchTerm;
    applyFilters();
}

/**
 * Filter by category
 */
function filterByCategory(category) {
    activeFilters.category = category;

    // Update button states
    document.querySelectorAll('#categoryFilters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === category || (category === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });

    applyFilters();
}

/**
 * Filter by priority
 */
function filterByPriority(priority) {
    activeFilters.priority = priority;

    // Update button states
    document.querySelectorAll('#priorityFilters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === priority || (priority === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });

    applyFilters();
}

/**
 * Apply all active filters
 */
function applyFilters() {
    filteredSkills = allSkills.filter(skill => {
        // Category filter
        if (activeFilters.category !== 'all' && skill.category !== activeFilters.category) {
            return false;
        }

        // Priority filter
        if (activeFilters.priority !== 'all' && skill.priority !== activeFilters.priority) {
            return false;
        }

        // Search filter
        if (activeFilters.search) {
            const searchLower = activeFilters.search;
            const matchesName = skill.name.toLowerCase().includes(searchLower);
            const matchesDesc = skill.description ? skill.description.toLowerCase().includes(searchLower) : false;

            // Search in tools if they exist
            let matchesTools = false;
            if (Array.isArray(skill.tools)) {
                matchesTools = skill.tools.some(t =>
                    t.name.toLowerCase().includes(searchLower) ||
                    t.description.toLowerCase().includes(searchLower)
                );
            }

            if (!matchesName && !matchesDesc && !matchesTools) {
                return false;
            }
        }

        // Favorites filter
        if (activeFilters.favoritesOnly && !skill.isFavorite) {
            return false;
        }

        return true;
    });

    renderSkills();
    updateStats();
}

/**
 * Toggle favorites only mode
 */
function toggleFavoritesOnly() {
    activeFilters.favoritesOnly = !activeFilters.favoritesOnly;
    const btnText = document.getElementById('favBtnText');
    btnText.textContent = activeFilters.favoritesOnly ? 'Show All' : 'Show Favorites';
    applyFilters();
}

/**
 * Render skills grid
 */
function renderSkills() {
    const grid = document.getElementById('skillsGrid');
    grid.innerHTML = '';

    if (filteredSkills.length === 0) {
        grid.innerHTML = '<div class="col-12"><div class="alert alert-info">No skills match your filters. Try adjusting your filters or create a new skill.</div></div>';
        return;
    }

    filteredSkills.forEach(skill => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';

        const card = document.createElement('div');
        card.className = `card skill-card priority-${skill.priority}`;

        // Availability badges
        const availability = Array.isArray(skill.availability) ? skill.availability : [];
        const availBadges = availability.map(env => {
            const colors = { desktop: 'primary', code: 'success', web: 'info' };
            return `<span class="badge bg-${colors[env] || 'secondary'} availability-badge">${env}</span>`;
        }).join('');

        // Tools count
        const toolsCount = Array.isArray(skill.tools) ? skill.tools.length : 0;

        card.innerHTML = `
            <div class="card-body">
                <i class="fas ${skill.icon} skill-icon" style="color: ${skill.color};"></i>
                <i class="fas fa-star favorite-star ${skill.isFavorite ? 'active' : ''}"
                   onclick="event.stopPropagation(); toggleFavorite('${skill.id}')"></i>

                <h5 class="card-title">${escapeHtml(skill.name)}</h5>

                <div class="mb-2">
                    ${availBadges}
                </div>

                <span class="badge bg-secondary category-badge mb-2">${escapeHtml(skill.category)}</span>

                <p class="card-text small">${escapeHtml(skill.description || 'No description available')}</p>

                <div class="small text-muted mb-3">
                    <i class="fas fa-tools"></i> ${toolsCount} tools
                </div>

                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary flex-fill" onclick="event.stopPropagation(); showSkillDetail('${skill.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="event.stopPropagation(); editSkill('${skill.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteSkill('${skill.id}', '${escapeHtml(skill.name)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        col.appendChild(card);
        grid.appendChild(col);
    });
}

/**
 * Edit skill shorthand
 */
function editSkill(id) {
    const skill = allSkills.find(s => s.id === id);
    if (skill) {
        showEditSkillModal(skill);
    }
}

/**
 * Toggle skill favorite status via API
 */
async function toggleFavorite(skillId) {
    try {
        const response = await api.skills.toggleFavorite(skillId);

        if (response.success) {
            // Update local state
            const skill = allSkills.find(s => s.id === skillId);
            if (skill) {
                skill.isFavorite = !skill.isFavorite;
            }

            const filteredSkill = filteredSkills.find(s => s.id === skillId);
            if (filteredSkill) {
                filteredSkill.isFavorite = skill.isFavorite;
            }

            renderSkills();
            updateStats();

            const message = skill.isFavorite ? 'Added to favorites' : 'Removed from favorites';
            showToast(message, 'success');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showToast('Failed to update favorite status', 'error');
    }
}

/**
 * Show skill detail modal
 */
async function showSkillDetail(skillId) {
    const skill = allSkills.find(s => s.id === skillId);
    if (!skill) return;

    // Increment usage count
    try {
        await api.skills.incrementUsage(skillId);
    } catch (error) {
        console.error('Error incrementing usage:', error);
    }

    const availBadges = (Array.isArray(skill.availability) ? skill.availability : []).map(env => {
        const colors = { desktop: 'primary', code: 'success', web: 'info' };
        return `<span class="badge bg-${colors[env] || 'secondary'} me-1">${env}</span>`;
    }).join('');

    const toolsList = (Array.isArray(skill.tools) ? skill.tools : []).map(tool =>
        `<li><strong>${escapeHtml(tool.name)}:</strong> ${escapeHtml(tool.description)}</li>`
    ).join('');

    const examplesList = (Array.isArray(skill.usageExamples) ? skill.usageExamples : []).map(ex =>
        `<li>${escapeHtml(ex)}</li>`
    ).join('');

    const content = `
        <div class="mb-3">
            <i class="fas ${skill.icon} fa-3x mb-3" style="color: ${skill.color};"></i>
            <p class="lead">${escapeHtml(skill.longDescription || skill.description || 'No description available')}</p>
        </div>

        <div class="mb-3">
            <strong>Availability:</strong><br>
            ${availBadges}
        </div>

        <div class="mb-3">
            <strong>Category:</strong> <span class="badge bg-secondary">${escapeHtml(skill.category)}</span>
            <strong class="ms-3">Priority:</strong> <span class="badge bg-${skill.priority === 'critical' ? 'danger' : skill.priority === 'high' ? 'primary' : 'warning'}">${skill.priority}</span>
        </div>

        <hr>

        <h6><i class="fas fa-tools"></i> Available Tools (${Array.isArray(skill.tools) ? skill.tools.length : 0})</h6>
        <ul class="small">
            ${toolsList || '<li>No tools listed</li>'}
        </ul>

        <hr>

        <h6><i class="fas fa-lightbulb"></i> Usage Examples</h6>
        <ul class="small">
            ${examplesList || '<li>No examples listed</li>'}
        </ul>

        <hr>

        <div class="d-flex justify-content-between align-items-center">
            ${skill.documentation ? `
                <a href="${skill.documentation}" target="_blank" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-book"></i> Documentation
                </a>
            ` : '<div></div>'}
            <button class="btn btn-sm ${skill.isFavorite ? 'btn-warning' : 'btn-outline-warning'}"
                    onclick="toggleFavorite('${skill.id}');
                             const modal = bootstrap.Modal.getInstance(document.getElementById('skillDetailModal'));
                             modal.hide();">
                <i class="fas fa-star"></i> ${skill.isFavorite ? 'Unfavorite' : 'Favorite'}
            </button>
        </div>
    `;

    document.getElementById('modalSkillName').textContent = skill.name;
    document.getElementById('modalSkillContent').innerHTML = content;

    const modal = new bootstrap.Modal(document.getElementById('skillDetailModal'));
    modal.show();
}

/**
 * Update statistics
 */
function updateStats() {
    const total = allSkills.length;
    const critical = allSkills.filter(s => s.priority === 'critical').length;
    const favorites = allSkills.filter(s => s.isFavorite).length;
    const showing = filteredSkills.length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('criticalCount').textContent = critical;
    document.getElementById('favoriteCount').textContent = favorites;
    document.getElementById('filteredCount').textContent = showing;
}

/**
 * HTML escape utility
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when page loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initSkillsManager);
}
