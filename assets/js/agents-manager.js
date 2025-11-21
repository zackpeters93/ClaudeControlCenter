/**
 * Agents Manager - JavaScript
 * Manages Claude Code Task agents and Anthropic workflow patterns
 * API-driven with full CRUD operations
 */

// State management
let allAgents = [];
let filteredAgents = [];
let currentAgent = null;
let searchQuery = '';
let selectedCategory = 'all';
let showFavoritesOnly = false;

// Category colors and icons
const CATEGORY_CONFIG = {
  'claude-code': { label: 'Claude Code Agent', color: '#0984e3', icon: 'fa-robot' },
  'workflow-pattern': { label: 'Workflow Pattern', color: '#6c5ce7', icon: 'fa-project-diagram' },
  'custom': { label: 'Custom Agent', color: '#00b894', icon: 'fa-user-cog' }
};

/**
 * Initialize Agents Manager
 */
async function initAgentsManager() {
  await loadAgents();
  renderFilters();
  updateStats();
}

/**
 * Load agents from API
 */
async function loadAgents() {
  try {
    const response = await api.agents.getAll();
    if (response.success) {
      allAgents = response.data;
      applyFilters();
    } else {
      showToast('Error loading agents', 'error');
    }
  } catch (error) {
    console.error('Error loading agents:', error);
    showToast('Failed to load agents', 'error');
  }
}

/**
 * Apply filters and search
 */
function applyFilters() {
  filteredAgents = allAgents.filter(agent => {
    // Category filter
    if (selectedCategory !== 'all' && agent.category !== selectedCategory) {
      return false;
    }

    // Favorites filter
    if (showFavoritesOnly && !agent.isFavorite) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchFields = [
        agent.name,
        agent.description,
        agent.longDescription,
        agent.type,
        ...(agent.whenToUse || []),
        ...(agent.tools || [])
      ].filter(Boolean);

      return searchFields.some(field =>
        field.toLowerCase().includes(query)
      );
    }

    return true;
  });

  renderAgents();
  updateStats();
}

/**
 * Render category filters
 */
function renderFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  let html = `
    <button class="btn btn-outline-secondary filter-btn ${selectedCategory === 'all' ? 'active' : ''}"
            onclick="filterByCategory('all')">
      <i class="fas fa-globe"></i> All
    </button>
  `;

  Object.entries(CATEGORY_CONFIG).forEach(([key, config]) => {
    html += `
      <button class="btn btn-outline-secondary filter-btn ${selectedCategory === key ? 'active' : ''}"
              onclick="filterByCategory('${key}')"
              style="${selectedCategory === key ? `background-color: ${config.color}; border-color: ${config.color}; color: white;` : ''}">
        <i class="fas ${config.icon}"></i> ${config.label}
      </button>
    `;
  });

  container.innerHTML = html;
}

/**
 * Filter by category
 */
function filterByCategory(category) {
  selectedCategory = category;
  renderFilters();
  applyFilters();
}

/**
 * Handle search input
 */
function handleSearch() {
  searchQuery = document.getElementById('searchInput').value;
  applyFilters();
}

/**
 * Toggle favorites only
 */
function toggleFavoritesOnly() {
  showFavoritesOnly = !showFavoritesOnly;
  const btn = document.getElementById('favBtnText');
  if (btn) {
    btn.textContent = showFavoritesOnly ? 'Show All' : 'Show Favorites';
  }
  applyFilters();
}

/**
 * Toggle favorite status
 */
async function toggleFavorite(agentId) {
  try {
    const agent = allAgents.find(a => a.id === agentId);
    if (!agent) return;

    const response = await api.agents.update(agentId, {
      isFavorite: !agent.isFavorite
    });

    if (response.success) {
      agent.isFavorite = !agent.isFavorite;
      applyFilters();
      showToast(agent.isFavorite ? 'Added to favorites' : 'Removed from favorites', 'success');
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    showToast('Failed to update favorite', 'error');
  }
}

/**
 * Render agents grid
 */
function renderAgents() {
  const grid = document.getElementById('agentsGrid');
  if (!grid) return;

  if (filteredAgents.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-search fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">No agents found</h5>
        <p class="text-muted">Try adjusting your filters or search query</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredAgents.map(agent => createAgentCard(agent)).join('');
}

/**
 * Create agent card HTML
 */
function createAgentCard(agent) {
  const config = CATEGORY_CONFIG[agent.category] || CATEGORY_CONFIG.custom;
  const favoriteClass = agent.isFavorite ? 'active' : '';

  // Build use case badges (first 3)
  const useCases = Array.isArray(agent.whenToUse) ? agent.whenToUse : [];
  const useCaseBadges = useCases.slice(0, 3).map(useCase =>
    `<span class="badge bg-success use-case-badge">${useCase}</span>`
  ).join('');

  // Parallel/Sequential badge
  const parallelBadge = agent.parallelCapable
    ? '<span class="badge bg-primary">Parallel Capable</span>'
    : '<span class="badge bg-secondary">Sequential Only</span>';

  // Thoroughness badge
  const thoroughnessBadge = agent.thoroughnessLevels
    ? '<span class="badge bg-info">Has Thoroughness Levels</span>'
    : '';

  // Tools count
  const tools = Array.isArray(agent.tools) ? agent.tools : [];
  const toolsCount = tools.length;

  // Example prompts count
  const examples = Array.isArray(agent.examplePrompts) ? agent.examplePrompts : [];

  return `
    <div class="col-xl-4 col-lg-6 col-md-6 mb-4">
      <div class="card agent-card" style="border-left-color: ${agent.color};" onclick="showAgentDetail('${agent.id}')">
        <i class="fas fa-star favorite-star ${favoriteClass}"
           onclick="event.stopPropagation(); toggleFavorite('${agent.id}')"
           title="${agent.isFavorite ? 'Remove from favorites' : 'Add to favorites'}"></i>

        <div class="card-body">
          <div class="text-center">
            <i class="fas ${agent.icon} agent-icon" style="color: ${agent.color};"></i>
          </div>

          <h5 class="card-title text-center">${agent.name}</h5>

          <p class="card-text small text-muted">${agent.description}</p>

          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge" style="background-color: ${config.color}; color: white;">
              ${config.label}
            </span>
          </div>

          <div class="mb-2">
            ${parallelBadge}
            ${thoroughnessBadge}
          </div>

          <hr>

          <small><strong>When to Use:</strong></small><br>
          <div class="mt-1 mb-2">
            ${useCaseBadges}
            ${useCases.length > 3 ? `<span class="badge bg-light text-dark">+${useCases.length - 3} more</span>` : ''}
          </div>

          <div class="small text-muted">
            <i class="fas fa-tools"></i> ${toolsCount} tool${toolsCount !== 1 ? 's' : ''}
            <span class="ms-3"><i class="fas fa-lightbulb"></i> ${examples.length} example${examples.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show agent detail modal
 */
function showAgentDetail(agentId) {
  const agent = allAgents.find(a => a.id === agentId);
  if (!agent) return;

  currentAgent = agent;
  document.getElementById('modalAgentName').textContent = agent.name;

  // Build thoroughness levels section
  let thoroughnessSection = '';
  if (agent.thoroughnessLevels && typeof agent.thoroughnessLevels === 'object') {
    thoroughnessSection = `
      <h6 class="mt-4"><i class="fas fa-layer-group"></i> Thoroughness Levels</h6>
      <ul>
        ${Object.entries(agent.thoroughnessLevels).map(([level, desc]) =>
          `<li><strong>${level}:</strong> ${desc}</li>`
        ).join('')}
      </ul>
    `;
  }

  // Build example prompts
  const examples = Array.isArray(agent.examplePrompts) ? agent.examplePrompts : [];
  const examplesHTML = examples.map(ex => `
    <div class="card mb-2">
      <div class="card-body p-3">
        <strong>${ex.title}</strong>
        <div class="code-snippet mt-2">${ex.prompt}</div>
      </div>
    </div>
  `).join('');

  // Build tools list
  const tools = Array.isArray(agent.tools) ? agent.tools : [];
  const toolsList = tools.length > 0
    ? tools.map(tool => `<li>${tool}</li>`).join('')
    : '<li class="text-muted">No specific tools defined</li>';

  // Build when to use lists
  const whenToUse = Array.isArray(agent.whenToUse) ? agent.whenToUse : [];
  const whenToUseList = whenToUse.map(item => `<li>${item}</li>`).join('');

  const whenNotToUse = Array.isArray(agent.whenNotToUse) ? agent.whenNotToUse : [];
  const whenNotToUseList = whenNotToUse.length > 0
    ? whenNotToUse.map(item => `<li>${item}</li>`).join('')
    : '<li class="text-muted">No specific restrictions</li>';

  // Build best practices
  const bestPractices = Array.isArray(agent.bestPractices) ? agent.bestPractices : [];
  const bestPracticesList = bestPractices.length > 0
    ? bestPractices.map(item => `<li>${item}</li>`).join('')
    : '<li class="text-muted">No specific best practices defined</li>';

  const config = CATEGORY_CONFIG[agent.category] || CATEGORY_CONFIG.custom;

  const content = `
    <div class="mb-3">
      <i class="fas ${agent.icon} fa-3x mb-3" style="color: ${agent.color};"></i>
      <p class="lead">${agent.longDescription || agent.description}</p>
    </div>

    <div class="row mb-3">
      <div class="col-md-6">
        <span class="badge ${agent.parallelCapable ? 'bg-primary' : 'bg-secondary'}">
          ${agent.parallelCapable ? 'Parallel Capable' : 'Sequential Only'}
        </span>
        <span class="badge ms-2" style="background-color: ${config.color}; color: white;">
          ${config.label}
        </span>
      </div>
      <div class="col-md-6 text-end">
        <span class="badge bg-secondary">Used ${agent.usageCount} times</span>
      </div>
    </div>

    <hr>

    <div class="row">
      <div class="col-md-6">
        <h6><i class="fas fa-check-circle text-success"></i> When to Use</h6>
        <ul class="small">${whenToUseList}</ul>
      </div>
      <div class="col-md-6">
        <h6><i class="fas fa-times-circle text-danger"></i> When NOT to Use</h6>
        <ul class="small">${whenNotToUseList}</ul>
      </div>
    </div>

    ${thoroughnessSection}

    <hr>

    <h6><i class="fas fa-tools"></i> Available Tools</h6>
    <ul class="small">${toolsList}</ul>

    <hr>

    <h6><i class="fas fa-code"></i> Example Prompts</h6>
    ${examplesHTML || '<p class="text-muted">No examples available</p>'}

    <hr>

    <h6><i class="fas fa-star"></i> Best Practices</h6>
    <ul class="small">${bestPracticesList}</ul>
  `;

  document.getElementById('modalAgentContent').innerHTML = content;

  const modal = new bootstrap.Modal(document.getElementById('agentDetailModal'));
  modal.show();
}

/**
 * Update statistics
 */
function updateStats() {
  document.getElementById('totalAgents').textContent = allAgents.length;

  const useCaseCount = allAgents.reduce((sum, agent) => {
    const whenToUse = Array.isArray(agent.whenToUse) ? agent.whenToUse : [];
    return sum + whenToUse.length;
  }, 0);
  document.getElementById('useCaseCount').textContent = useCaseCount + '+';

  const thoroughnessAgents = allAgents.filter(a => a.thoroughnessLevels).length;
  document.getElementById('thoroughnessLevels').textContent = thoroughnessAgents;

  const parallelCapable = allAgents.filter(a => a.parallelCapable).length;
  document.getElementById('parallelCapable').textContent = parallelCapable;

  // Update filtered count if element exists
  const filteredCountEl = document.getElementById('filteredCount');
  if (filteredCountEl) {
    filteredCountEl.textContent = filteredAgents.length;
  }
}

/**
 * Show create/edit modal
 */
function showCreateAgentModal(agentId = null) {
  const isEdit = !!agentId;
  const agent = isEdit ? allAgents.find(a => a.id === agentId) : null;

  const title = isEdit ? `Edit: ${agent.name}` : 'Create New Agent';

  const modalHtml = `
    <div class="modal fade" id="createAgentModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header" style="background-color: #00b894; color: white;">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="agentForm">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Name *</label>
                  <input type="text" class="form-control" id="agentName" required
                         value="${agent?.name || ''}">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Type *</label>
                  <input type="text" class="form-control" id="agentType" required
                         placeholder="e.g., custom-agent"
                         value="${agent?.type || ''}">
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Category *</label>
                  <select class="form-select" id="agentCategory" required>
                    <option value="custom" ${agent?.category === 'custom' ? 'selected' : ''}>Custom Agent</option>
                    <option value="claude-code" ${agent?.category === 'claude-code' ? 'selected' : ''}>Claude Code Agent</option>
                    <option value="workflow-pattern" ${agent?.category === 'workflow-pattern' ? 'selected' : ''}>Workflow Pattern</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Icon (Font Awesome)</label>
                  <input type="text" class="form-control" id="agentIcon"
                         placeholder="e.g., fa-robot"
                         value="${agent?.icon || 'fa-robot'}">
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Color</label>
                  <input type="color" class="form-control form-control-color" id="agentColor"
                         value="${agent?.color || '#0984e3'}">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Options</label>
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="agentParallel"
                           ${agent?.parallelCapable ? 'checked' : ''}>
                    <label class="form-check-label">Parallel Capable</label>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Short Description *</label>
                <input type="text" class="form-control" id="agentDescription" required
                       placeholder="Brief description of the agent"
                       value="${agent?.description || ''}">
              </div>

              <div class="mb-3">
                <label class="form-label">Long Description</label>
                <textarea class="form-control" id="agentLongDescription" rows="3"
                          placeholder="Detailed description...">${agent?.longDescription || ''}</textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Tools (comma-separated)</label>
                <input type="text" class="form-control" id="agentTools"
                       placeholder="e.g., Read, Write, Edit, Grep"
                       value="${Array.isArray(agent?.tools) ? agent.tools.join(', ') : ''}">
              </div>

              <div class="mb-3">
                <label class="form-label">When to Use (one per line)</label>
                <textarea class="form-control" id="agentWhenToUse" rows="3"
                          placeholder="Enter each use case on a new line...">${Array.isArray(agent?.whenToUse) ? agent.whenToUse.join('\n') : ''}</textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">When NOT to Use (one per line)</label>
                <textarea class="form-control" id="agentWhenNotToUse" rows="3"
                          placeholder="Enter each restriction on a new line...">${Array.isArray(agent?.whenNotToUse) ? agent.whenNotToUse.join('\n') : ''}</textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Best Practices (one per line)</label>
                <textarea class="form-control" id="agentBestPractices" rows="3"
                          placeholder="Enter each best practice on a new line...">${Array.isArray(agent?.bestPractices) ? agent.bestPractices.join('\n') : ''}</textarea>
              </div>

              <input type="hidden" id="agentId" value="${agent?.id || ''}">
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" onclick="saveAgent()">
              <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existing = document.getElementById('createAgentModal');
  if (existing) existing.remove();

  // Add new modal
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('createAgentModal'));
  modal.show();
}

/**
 * Save agent (create or update)
 */
async function saveAgent() {
  const agentId = document.getElementById('agentId').value;
  const isEdit = !!agentId;

  // Parse form data
  const tools = document.getElementById('agentTools').value
    .split(',')
    .map(t => t.trim())
    .filter(t => t);

  const whenToUse = document.getElementById('agentWhenToUse').value
    .split('\n')
    .map(t => t.trim())
    .filter(t => t);

  const whenNotToUse = document.getElementById('agentWhenNotToUse').value
    .split('\n')
    .map(t => t.trim())
    .filter(t => t);

  const bestPractices = document.getElementById('agentBestPractices').value
    .split('\n')
    .map(t => t.trim())
    .filter(t => t);

  const data = {
    name: document.getElementById('agentName').value,
    type: document.getElementById('agentType').value,
    category: document.getElementById('agentCategory').value,
    description: document.getElementById('agentDescription').value,
    longDescription: document.getElementById('agentLongDescription').value || null,
    icon: document.getElementById('agentIcon').value || 'fa-robot',
    color: document.getElementById('agentColor').value,
    parallelCapable: document.getElementById('agentParallel').checked,
    tools: tools.length > 0 ? tools : null,
    whenToUse: whenToUse,
    whenNotToUse: whenNotToUse.length > 0 ? whenNotToUse : null,
    bestPractices: bestPractices.length > 0 ? bestPractices : null,
    examplePrompts: [], // TODO: Add example prompts editor
    source: 'manual'
  };

  try {
    let response;
    if (isEdit) {
      response = await api.agents.update(agentId, data);
    } else {
      response = await api.agents.create(data);
    }

    if (response.success) {
      // Close modal
      bootstrap.Modal.getInstance(document.getElementById('createAgentModal')).hide();

      // Reload data
      await loadAgents();

      showToast(`Agent ${isEdit ? 'updated' : 'created'} successfully`, 'success');
    } else {
      showToast(response.error || 'Failed to save agent', 'error');
    }
  } catch (error) {
    console.error('Error saving agent:', error);
    showToast('Failed to save agent', 'error');
  }
}

/**
 * Edit current agent
 */
function editCurrentAgent() {
  if (!currentAgent) return;

  // Close detail modal
  bootstrap.Modal.getInstance(document.getElementById('agentDetailModal')).hide();

  // Open edit modal
  setTimeout(() => {
    showCreateAgentModal(currentAgent.id);
  }, 300);
}

/**
 * Delete current agent
 */
async function deleteCurrentAgent() {
  if (!currentAgent) return;

  if (!confirm(`Are you sure you want to delete "${currentAgent.name}"?`)) {
    return;
  }

  try {
    const response = await api.agents.delete(currentAgent.id);

    if (response.success) {
      // Close modal
      bootstrap.Modal.getInstance(document.getElementById('agentDetailModal')).hide();

      // Reload data
      await loadAgents();

      showToast('Agent deleted successfully', 'success');
    } else {
      showToast(response.error || 'Failed to delete agent', 'error');
    }
  } catch (error) {
    console.error('Error deleting agent:', error);
    showToast('Failed to delete agent', 'error');
  }
}

/**
 * Increment usage count
 */
async function incrementUsage(agentId) {
  try {
    await api.agents.incrementUsage(agentId);
    const agent = allAgents.find(a => a.id === agentId);
    if (agent) agent.usageCount++;
  } catch (error) {
    console.error('Error incrementing usage:', error);
  }
}

// Initialize when page loads
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initAgentsManager);
}
