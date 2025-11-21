/**
 * MCP Library - JavaScript (Phase 3: API-Connected CRUD)
 * Manages MCP Servers Library with search, filters, and full CRUD operations
 */

// State management
let allMcps = [];
let filteredMcps = [];
let activeFilters = {
    category: 'all',
    status: 'all',
    search: '',
    favoritesOnly: false
};

/**
 * Initialize MCP Library
 */
async function initMcpLibrary() {
    await loadMcpsFromAPI();
    populateFilters();
    renderMcps();
    updateStats();
}

/**
 * Load MCPs from backend API
 */
async function loadMcpsFromAPI() {
    try {
        const response = await api.mcps.getAll();
        if (response.success) {
            allMcps = response.data;
            filteredMcps = [...allMcps];
            console.log(`Loaded ${allMcps.length} MCPs from API`);
        } else {
            showToast('Failed to load MCPs', 'error');
        }
    } catch (error) {
        console.error('Error loading MCPs:', error);
        showToast('Error loading MCPs from server', 'error');
        allMcps = [];
        filteredMcps = [];
    }
}

/**
 * Show create MCP modal
 */
function showCreateMcpModal() {
    const fields = [
        { name: 'name', label: 'MCP Name', type: 'text', required: true, placeholder: 'e.g., Desktop Commander' },
        { name: 'category', label: 'Category', type: 'text', required: true, placeholder: 'e.g., File Management' },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'testing', label: 'Testing' }
            ]
        },
        { name: 'icon', label: 'Icon Class', type: 'text', required: true, placeholder: 'e.g., fa-terminal', default: 'fa-plug' },
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
            name: 'configuration',
            label: 'Configuration (JSON)',
            type: 'json',
            required: true,
            rows: 6,
            default: JSON.stringify({ command: 'npx', args: ['-y', '@modelcontextprotocol/server-name'] }, null, 2),
            help: 'Configuration object for claude_desktop_config.json'
        },
        {
            name: 'configExample',
            label: 'Configuration Example',
            type: 'textarea',
            required: true,
            rows: 8,
            default: `{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-name"]
    }
  }
}`,
            help: 'Full configuration example to show users'
        },
        {
            name: 'capabilities',
            label: 'Capabilities (JSON)',
            type: 'json',
            required: true,
            rows: 8,
            default: JSON.stringify([{ name: 'example_tool', description: 'Tool description' }], null, 2),
            help: 'Array of {name, description} objects'
        },
        { name: 'description', label: 'Short Description', type: 'textarea', required: true, rows: 3, placeholder: 'Brief description of what this MCP provides' },
        { name: 'documentation', label: 'Documentation URL', type: 'url', required: false, placeholder: 'https://...' },
        { name: 'githubUrl', label: 'GitHub URL', type: 'url', required: false, placeholder: 'https://github.com/...' }
    ];

    showFormModal({
        title: 'Create New MCP Server',
        fields: fields,
        submitText: 'Create MCP',
        onSubmit: async (data) => {
            await createMcp(data);
        }
    });
}

/**
 * Show edit MCP modal
 */
function showEditMcpModal(mcp) {
    const fields = [
        { name: 'name', label: 'MCP Name', type: 'text', required: true },
        { name: 'category', label: 'Category', type: 'text', required: true },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'testing', label: 'Testing' }
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
            name: 'configuration',
            label: 'Configuration (JSON)',
            type: 'json',
            required: true,
            rows: 6,
            help: 'Configuration object for claude_desktop_config.json'
        },
        {
            name: 'configExample',
            label: 'Configuration Example',
            type: 'textarea',
            required: true,
            rows: 8,
            help: 'Full configuration example to show users'
        },
        {
            name: 'capabilities',
            label: 'Capabilities (JSON)',
            type: 'json',
            required: true,
            rows: 8,
            help: 'Array of {name, description} objects'
        },
        { name: 'description', label: 'Short Description', type: 'textarea', required: true, rows: 3 },
        { name: 'documentation', label: 'Documentation URL', type: 'url', required: false },
        { name: 'githubUrl', label: 'GitHub URL', type: 'url', required: false }
    ];

    showFormModal({
        title: `Edit MCP: ${mcp.name}`,
        fields: fields,
        data: mcp,
        submitText: 'Save Changes',
        onSubmit: async (data) => {
            await updateMcp(mcp.id, data);
        }
    });
}

/**
 * Create new MCP via API
 */
async function createMcp(data) {
    try {
        const response = await api.mcps.create({
            ...data,
            source: 'manual'
        });

        if (response.success) {
            showToast('MCP created successfully', 'success');
            await loadMcpsFromAPI();
            populateFilters();
            applyFilters();
        }
    } catch (error) {
        console.error('Error creating MCP:', error);
        showToast('Failed to create MCP', 'error');
    }
}

/**
 * Update existing MCP via API
 */
async function updateMcp(id, data) {
    try {
        const response = await api.mcps.update(id, data);

        if (response.success) {
            showToast('MCP updated successfully', 'success');
            await loadMcpsFromAPI();
            applyFilters();
        }
    } catch (error) {
        console.error('Error updating MCP:', error);
        showToast('Failed to update MCP', 'error');
    }
}

/**
 * Delete MCP with confirmation
 */
function deleteMcp(id, name) {
    showConfirm({
        title: 'Delete MCP Server',
        message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: '#d63031',
        onConfirm: async () => {
            try {
                const response = await api.mcps.delete(id);

                if (response.success) {
                    showToast('MCP deleted successfully', 'success');
                    await loadMcpsFromAPI();
                    populateFilters();
                    applyFilters();
                }
            } catch (error) {
                console.error('Error deleting MCP:', error);
                showToast('Failed to delete MCP', 'error');
            }
        }
    });
}

/**
 * Populate filter buttons
 */
function populateFilters() {
    // Get unique categories from loaded MCPs
    const categories = ['all', ...new Set(allMcps.map(m => m.category))];
    const statuses = ['all', 'active', 'inactive', 'testing'];

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

    // Status filters
    const statusFilters = document.getElementById('statusFilters');
    statusFilters.innerHTML = '';
    statuses.forEach(status => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-outline-primary filter-btn' + (status === 'all' ? ' active' : '');
        btn.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        btn.onclick = () => filterByStatus(status);
        statusFilters.appendChild(btn);
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
 * Filter by status
 */
function filterByStatus(status) {
    activeFilters.status = status;

    // Update button states
    document.querySelectorAll('#statusFilters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === status || (status === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });

    applyFilters();
}

/**
 * Apply all active filters
 */
function applyFilters() {
    filteredMcps = allMcps.filter(mcp => {
        // Category filter
        if (activeFilters.category !== 'all' && mcp.category !== activeFilters.category) {
            return false;
        }

        // Status filter
        if (activeFilters.status !== 'all' && mcp.status !== activeFilters.status) {
            return false;
        }

        // Search filter
        if (activeFilters.search) {
            const searchLower = activeFilters.search;
            const matchesName = mcp.name.toLowerCase().includes(searchLower);
            const matchesDesc = mcp.description ? mcp.description.toLowerCase().includes(searchLower) : false;

            // Search in capabilities if they exist
            let matchesCapabilities = false;
            if (Array.isArray(mcp.capabilities)) {
                matchesCapabilities = mcp.capabilities.some(c =>
                    c.name.toLowerCase().includes(searchLower) ||
                    c.description.toLowerCase().includes(searchLower)
                );
            }

            if (!matchesName && !matchesDesc && !matchesCapabilities) {
                return false;
            }
        }

        // Favorites filter
        if (activeFilters.favoritesOnly && !mcp.isFavorite) {
            return false;
        }

        return true;
    });

    renderMcps();
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
 * Render MCPs grid
 */
function renderMcps() {
    const grid = document.getElementById('mcpsGrid');
    grid.innerHTML = '';

    if (filteredMcps.length === 0) {
        grid.innerHTML = '<div class="col-12"><div class="alert alert-info">No MCPs match your filters. Try adjusting your filters or create a new MCP.</div></div>';
        return;
    }

    filteredMcps.forEach(mcp => {
        const col = document.createElement('div');
        col.className = 'col-xl-3 col-lg-4 col-md-6 mb-4';

        const card = document.createElement('div');
        // Use status-based styling instead of priority
        const statusClass = mcp.status === 'active' ? 'priority-high' : mcp.status === 'testing' ? 'priority-medium' : 'priority-low';
        card.className = `card skill-card ${statusClass}`;

        // Availability badges
        const availability = Array.isArray(mcp.availability) ? mcp.availability : [];
        const availBadges = availability.map(env => {
            const colors = { desktop: 'primary', code: 'success', web: 'info' };
            return `<span class="badge bg-${colors[env] || 'secondary'} availability-badge">${env}</span>`;
        }).join('');

        // Tool count
        const toolCount = mcp.toolCount || (Array.isArray(mcp.capabilities) ? mcp.capabilities.length : 0);

        card.innerHTML = `
            <div class="card-body">
                <i class="fas ${mcp.icon} skill-icon" style="color: ${mcp.color};"></i>
                <i class="fas fa-star favorite-star ${mcp.isFavorite ? 'active' : ''}"
                   onclick="event.stopPropagation(); toggleFavorite('${mcp.id}')"></i>

                <h5 class="card-title">${escapeHtml(mcp.name)}</h5>

                <div class="mb-2">
                    ${availBadges}
                </div>

                <span class="badge bg-secondary category-badge mb-2">${escapeHtml(mcp.category)}</span>

                <p class="card-text small">${escapeHtml(mcp.description || 'No description available')}</p>

                <div class="small text-muted mb-3">
                    <i class="fas fa-tools"></i> ${toolCount} tools
                </div>

                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary flex-fill" onclick="event.stopPropagation(); showMcpDetail('${mcp.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="event.stopPropagation(); editMcp('${mcp.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteMcp('${mcp.id}', '${escapeHtml(mcp.name)}')">
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
 * Edit MCP shorthand
 */
function editMcp(id) {
    const mcp = allMcps.find(m => m.id === id);
    if (mcp) {
        showEditMcpModal(mcp);
    }
}

/**
 * Toggle MCP favorite status via API
 */
async function toggleFavorite(mcpId) {
    try {
        // Since we don't have a toggleFavorite endpoint for MCPs yet,
        // we'll update using the update endpoint
        const mcp = allMcps.find(m => m.id === mcpId);
        if (!mcp) return;

        const response = await api.mcps.update(mcpId, {
            ...mcp,
            isFavorite: !mcp.isFavorite
        });

        if (response.success) {
            // Update local state
            mcp.isFavorite = !mcp.isFavorite;

            const filteredMcp = filteredMcps.find(m => m.id === mcpId);
            if (filteredMcp) {
                filteredMcp.isFavorite = mcp.isFavorite;
            }

            renderMcps();
            updateStats();

            const message = mcp.isFavorite ? 'Added to favorites' : 'Removed from favorites';
            showToast(message, 'success');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showToast('Failed to update favorite status', 'error');
    }
}

/**
 * Show MCP detail modal
 */
async function showMcpDetail(mcpId) {
    const mcp = allMcps.find(m => m.id === mcpId);
    if (!mcp) return;

    // Increment usage count
    try {
        await api.mcps.update(mcpId, {
            ...mcp,
            usageCount: (mcp.usageCount || 0) + 1
        });
    } catch (error) {
        console.error('Error incrementing usage:', error);
    }

    const availBadges = (Array.isArray(mcp.availability) ? mcp.availability : []).map(env => {
        const colors = { desktop: 'primary', code: 'success', web: 'info' };
        return `<span class="badge bg-${colors[env] || 'secondary'} me-1">${env}</span>`;
    }).join('');

    const capabilitiesList = (Array.isArray(mcp.capabilities) ? mcp.capabilities : []).map(cap =>
        `<li><strong>${escapeHtml(cap.name)}:</strong> ${escapeHtml(cap.description)}</li>`
    ).join('');

    const configExample = mcp.configExample || 'No configuration example available';

    const content = `
        <div class="mb-3">
            <i class="fas ${mcp.icon} fa-3x mb-3" style="color: ${mcp.color};"></i>
            <p class="lead">${escapeHtml(mcp.description || 'No description available')}</p>
        </div>

        <div class="mb-3">
            <strong>Availability:</strong><br>
            ${availBadges}
        </div>

        <div class="mb-3">
            <strong>Category:</strong> <span class="badge bg-secondary">${escapeHtml(mcp.category)}</span>
            <strong class="ms-3">Status:</strong> <span class="badge bg-${mcp.status === 'active' ? 'success' : mcp.status === 'testing' ? 'warning' : 'secondary'}">${mcp.status}</span>
        </div>

        <hr>

        <h6><i class="fas fa-tools"></i> Available Tools (${Array.isArray(mcp.capabilities) ? mcp.capabilities.length : 0})</h6>
        <ul class="small">
            ${capabilitiesList || '<li>No capabilities listed</li>'}
        </ul>

        <hr>

        <h6><i class="fas fa-code"></i> Configuration Example</h6>
        <pre class="bg-light p-3 rounded"><code>${escapeHtml(configExample)}</code></pre>

        <hr>

        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="d-flex gap-2">
                ${mcp.documentation ? `
                    <a href="${mcp.documentation}" target="_blank" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-book"></i> Documentation
                    </a>
                ` : ''}
                ${mcp.githubUrl ? `
                    <a href="${mcp.githubUrl}" target="_blank" class="btn btn-sm btn-outline-dark">
                        <i class="fab fa-github"></i> GitHub
                    </a>
                ` : ''}
            </div>
            <button class="btn btn-sm ${mcp.isFavorite ? 'btn-warning' : 'btn-outline-warning'}"
                    onclick="toggleFavorite('${mcp.id}');
                             const modal = bootstrap.Modal.getInstance(document.getElementById('mcpDetailModal'));
                             modal.hide();">
                <i class="fas fa-star"></i> ${mcp.isFavorite ? 'Unfavorite' : 'Favorite'}
            </button>
        </div>
    `;

    document.getElementById('modalMcpName').textContent = mcp.name;
    document.getElementById('modalMcpContent').innerHTML = content;

    const modal = new bootstrap.Modal(document.getElementById('mcpDetailModal'));
    modal.show();
}

/**
 * Update statistics
 */
function updateStats() {
    const total = allMcps.length;
    const active = allMcps.filter(m => m.status === 'active').length;
    const favorites = allMcps.filter(m => m.isFavorite).length;
    const showing = filteredMcps.length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('activeCount').textContent = active;
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
    document.addEventListener('DOMContentLoaded', initMcpLibrary);
}
