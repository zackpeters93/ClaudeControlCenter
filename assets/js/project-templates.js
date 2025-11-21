/**
 * Project Templates - JavaScript
 * API-driven template management with full CRUD
 */

// State
let allTemplates = [];
let filteredTemplates = [];
let currentTemplate = null;
let searchQuery = '';
let selectedCategory = 'all';

// Category config
const CATEGORY_CONFIG = {
  'web': { label: 'Web Development', color: '#d63031', icon: 'fa-globe' },
  'python': { label: 'Python', color: '#0984e3', icon: 'fa-python' },
  'embedded': { label: 'Embedded', color: '#00b894', icon: 'fa-microchip' },
  'devops': { label: 'DevOps', color: '#6c5ce7', icon: 'fa-docker' },
  'mobile': { label: 'Mobile', color: '#fdcb6e', icon: 'fa-mobile-alt' },
  'other': { label: 'Other', color: '#636e72', icon: 'fa-folder' }
};

/**
 * Initialize
 */
async function initProjectTemplates() {
  await loadTemplates();
  renderFilters();
  updateStats();
}

/**
 * Load templates from API
 */
async function loadTemplates() {
  try {
    const response = await api.templates.getAll();
    if (response.success) {
      allTemplates = response.data;
      applyFilters();
    } else {
      showToast('Error loading templates', 'error');
    }
  } catch (error) {
    console.error('Error loading templates:', error);
    showToast('Failed to load templates', 'error');
  }
}

/**
 * Apply filters
 */
function applyFilters() {
  filteredTemplates = allTemplates.filter(template => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const tags = Array.isArray(template.tags) ? template.tags : [];
      return [template.name, template.description, template.language, template.framework, ...tags]
        .filter(Boolean).some(f => f.toLowerCase().includes(query));
    }
    return true;
  });
  renderTemplates();
  updateStats();
}

/**
 * Render filters
 */
function renderFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  let html = `<button class="btn btn-outline-secondary filter-btn ${selectedCategory === 'all' ? 'active' : ''}" onclick="filterByCategory('all')"><i class="fas fa-globe"></i> All</button>`;
  Object.entries(CATEGORY_CONFIG).forEach(([key, config]) => {
    html += `<button class="btn btn-outline-secondary filter-btn ${selectedCategory === key ? 'active' : ''}" onclick="filterByCategory('${key}')" style="${selectedCategory === key ? `background-color: ${config.color}; border-color: ${config.color}; color: white;` : ''}"><i class="fas ${config.icon}"></i> ${config.label}</button>`;
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
 * Handle search
 */
function handleSearch() {
  searchQuery = document.getElementById('searchInput').value;
  applyFilters();
}

/**
 * Render templates grid
 */
function renderTemplates() {
  const grid = document.getElementById('templatesGrid');
  if (!grid) return;

  if (filteredTemplates.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center py-5"><i class="fas fa-search fa-3x text-muted mb-3"></i><h5 class="text-muted">No templates found</h5></div>`;
    return;
  }

  grid.innerHTML = filteredTemplates.map(t => createTemplateCard(t)).join('');
}

/**
 * Create template card
 */
function createTemplateCard(template) {
  const config = CATEGORY_CONFIG[template.category] || CATEGORY_CONFIG.other;
  const files = Array.isArray(template.files) ? template.files : [];
  const tags = Array.isArray(template.tags) ? template.tags : [];

  return `
    <div class="col-xl-4 col-lg-6 col-md-6 mb-4">
      <div class="card template-card" style="border-left-color: ${config.color};" onclick="showTemplateDetail('${template.id}')">
        <div class="card-body">
          <div class="text-center">
            <i class="fas ${config.icon} template-icon" style="color: ${config.color};"></i>
          </div>
          <h5 class="card-title text-center">${template.name}</h5>
          <p class="card-text small text-muted">${template.description}</p>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge" style="background-color: ${config.color}; color: white;">${config.label}</span>
            <span class="badge bg-secondary">${template.language || 'N/A'}</span>
          </div>
          <div class="mt-2">
            ${tags.slice(0, 3).map(tag => `<span class="badge bg-light text-dark me-1">${tag}</span>`).join('')}
          </div>
          <div class="small text-muted mt-2">
            <i class="fas fa-file"></i> ${files.length} files
            <span class="ms-3"><i class="fas fa-download"></i> ${template.usageCount || 0} uses</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show template detail modal
 */
function showTemplateDetail(templateId) {
  const template = allTemplates.find(t => t.id === templateId);
  if (!template) return;
  currentTemplate = template;

  const config = CATEGORY_CONFIG[template.category] || CATEGORY_CONFIG.other;
  const files = Array.isArray(template.files) ? template.files : [];
  const tags = Array.isArray(template.tags) ? template.tags : [];

  document.getElementById('modalTemplateName').textContent = template.name;

  const content = `
    <div class="mb-3">
      <i class="fas ${config.icon} fa-3x mb-3" style="color: ${config.color};"></i>
      <p class="lead">${template.description}</p>
    </div>
    <div class="mb-3">
      <span class="badge" style="background-color: ${config.color}; color: white;">${config.label}</span>
      <span class="badge bg-secondary ms-2">${template.language || 'N/A'}</span>
      ${template.framework ? `<span class="badge bg-info ms-2">${template.framework}</span>` : ''}
      <span class="badge bg-dark ms-2">${template.usageCount || 0} uses</span>
    </div>
    <div class="mb-3">${tags.map(tag => `<span class="badge bg-light text-dark me-1">${tag}</span>`).join('')}</div>
    <hr>
    <h6><i class="fas fa-folder-tree"></i> Project Structure</h6>
    <div class="file-tree"><pre>${template.structure || 'No structure defined'}</pre></div>
    <hr>
    <h6><i class="fas fa-file-code"></i> Included Files (${files.length})</h6>
    <ul class="small">${files.map(f => `<li><code>${f.name}</code></li>`).join('') || '<li>No files</li>'}</ul>
  `;

  document.getElementById('modalTemplateContent').innerHTML = content;
  const modal = new bootstrap.Modal(document.getElementById('templateDetailModal'));
  modal.show();
}

/**
 * Export template
 */
async function exportCurrentTemplate() {
  if (!currentTemplate) return;

  const files = Array.isArray(currentTemplate.files) ? currentTemplate.files : [];
  let exportContent = `# ${currentTemplate.name}\n\n`;
  exportContent += `**Category:** ${currentTemplate.category}\n`;
  exportContent += `**Language:** ${currentTemplate.language || 'N/A'}\n`;
  exportContent += `**Framework:** ${currentTemplate.framework || 'N/A'}\n\n`;
  exportContent += `## Description\n\n${currentTemplate.description}\n\n`;
  exportContent += `## Project Structure\n\n\`\`\`\n${currentTemplate.structure || 'N/A'}\n\`\`\`\n\n`;
  exportContent += `## Files\n\n`;
  files.forEach(file => {
    exportContent += `### ${file.name}\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
  });

  const blob = new Blob([exportContent], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${currentTemplate.name.toLowerCase().replace(/\s+/g, '-')}-template.md`;
  link.click();

  // Increment usage
  try {
    await api.templates.export(currentTemplate.id);
    currentTemplate.usageCount = (currentTemplate.usageCount || 0) + 1;
  } catch (e) { console.error(e); }

  showToast(`Template "${currentTemplate.name}" exported!`, 'success');
}

/**
 * Show create/edit modal
 */
function showCreateTemplateModal(templateId = null) {
  const isEdit = !!templateId;
  const template = isEdit ? allTemplates.find(t => t.id === templateId) : null;
  const title = isEdit ? `Edit: ${template.name}` : 'Create New Template';
  const tags = Array.isArray(template?.tags) ? template.tags.join(', ') : '';

  const modalHtml = `
    <div class="modal fade" id="createTemplateModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header" style="background-color: #00b894; color: white;">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="templateForm">
              <div class="row">
                <div class="col-md-8 mb-3">
                  <label class="form-label">Name *</label>
                  <input type="text" class="form-control" id="templateName" required value="${template?.name || ''}">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Category *</label>
                  <select class="form-select" id="templateCategory" required>
                    ${Object.entries(CATEGORY_CONFIG).map(([k, v]) => `<option value="${k}" ${template?.category === k ? 'selected' : ''}>${v.label}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Language</label>
                  <input type="text" class="form-control" id="templateLanguage" value="${template?.language || ''}">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Framework</label>
                  <input type="text" class="form-control" id="templateFramework" value="${template?.framework || ''}">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Description *</label>
                <textarea class="form-control" id="templateDescription" rows="2" required>${template?.description || ''}</textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Tags (comma-separated)</label>
                <input type="text" class="form-control" id="templateTags" value="${tags}">
              </div>
              <div class="mb-3">
                <label class="form-label">Project Structure (ASCII tree)</label>
                <textarea class="form-control" id="templateStructure" rows="8" style="font-family: monospace;">${template?.structure || ''}</textarea>
              </div>
              <input type="hidden" id="templateId" value="${template?.id || ''}">
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" onclick="saveTemplate()"><i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById('createTemplateModal');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  new bootstrap.Modal(document.getElementById('createTemplateModal')).show();
}

/**
 * Save template
 */
async function saveTemplate() {
  const templateId = document.getElementById('templateId').value;
  const isEdit = !!templateId;

  const tags = document.getElementById('templateTags').value.split(',').map(t => t.trim()).filter(t => t);

  const data = {
    name: document.getElementById('templateName').value,
    category: document.getElementById('templateCategory').value,
    description: document.getElementById('templateDescription').value,
    language: document.getElementById('templateLanguage').value || null,
    framework: document.getElementById('templateFramework').value || null,
    structure: document.getElementById('templateStructure').value || null,
    tags: tags,
    files: [], // Files would need a more complex editor
    source: 'manual'
  };

  try {
    const response = isEdit ? await api.templates.update(templateId, data) : await api.templates.create(data);
    if (response.success) {
      bootstrap.Modal.getInstance(document.getElementById('createTemplateModal')).hide();
      await loadTemplates();
      showToast(`Template ${isEdit ? 'updated' : 'created'} successfully`, 'success');
    } else {
      showToast(response.error || 'Failed to save', 'error');
    }
  } catch (error) {
    console.error(error);
    showToast('Failed to save template', 'error');
  }
}

/**
 * Edit current template
 */
function editCurrentTemplate() {
  if (!currentTemplate) return;
  bootstrap.Modal.getInstance(document.getElementById('templateDetailModal')).hide();
  setTimeout(() => showCreateTemplateModal(currentTemplate.id), 300);
}

/**
 * Delete current template
 */
async function deleteCurrentTemplate() {
  if (!currentTemplate) return;
  if (!confirm(`Delete "${currentTemplate.name}"?`)) return;

  try {
    const response = await api.templates.delete(currentTemplate.id);
    if (response.success) {
      bootstrap.Modal.getInstance(document.getElementById('templateDetailModal')).hide();
      await loadTemplates();
      showToast('Template deleted', 'success');
    } else {
      showToast(response.error || 'Failed to delete', 'error');
    }
  } catch (error) {
    console.error(error);
    showToast('Failed to delete template', 'error');
  }
}

/**
 * Update stats
 */
function updateStats() {
  document.getElementById('totalTemplates').textContent = allTemplates.length;
  const custom = allTemplates.filter(t => t.source === 'manual').length;
  document.getElementById('customTemplates').textContent = custom;
  const usage = allTemplates.reduce((sum, t) => sum + (t.usageCount || 0), 0);
  document.getElementById('usageCount').textContent = usage;
  const files = allTemplates.reduce((sum, t) => sum + (Array.isArray(t.files) ? t.files.length : 0), 0);
  document.getElementById('totalFiles').textContent = files + '+';
}

// Initialize
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initProjectTemplates);
}
