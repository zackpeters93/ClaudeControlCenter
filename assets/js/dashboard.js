/**
 * Dashboard - API-driven stats and activity
 */

// State
let dashboardStats = {
  skills: 0,
  mcps: 0,
  agents: 0,
  templates: 0
};
let recentActivity = [];
let backendConnected = false;

/**
 * Initialize dashboard
 */
async function initDashboard() {
  updateDateTime();
  setInterval(() => {
    document.getElementById('currentTime').textContent = new Date().toLocaleTimeString('en-US');
  }, 1000);

  await checkBackendHealth();
  if (backendConnected) {
    await Promise.all([
      loadDashboardStats(),
      loadRecentActivity(),
      loadClaudeMDStatus()
    ]);
  }
}

/**
 * Check backend health
 */
async function checkBackendHealth() {
  try {
    const response = await api.health.check();
    backendConnected = response.success || response.status === 'healthy' || response.status === 'ok';
    updateConnectionStatus(backendConnected);
  } catch (error) {
    console.error('Backend health check failed:', error);
    backendConnected = false;
    updateConnectionStatus(false);
  }
}

/**
 * Update connection status display
 */
function updateConnectionStatus(connected) {
  const statusBadge = document.getElementById('backendStatus');
  const storageType = document.getElementById('storageType');

  if (statusBadge) {
    if (connected) {
      statusBadge.innerHTML = '<span class="badge bg-success">Connected</span>';
    } else {
      statusBadge.innerHTML = '<span class="badge bg-danger">Disconnected</span>';
    }
  }

  if (storageType) {
    storageType.textContent = connected ? 'PostgreSQL (Docker)' : 'Offline';
  }
}

/**
 * Load CLAUDE.md configuration status
 */
async function loadClaudeMDStatus() {
  try {
    const response = await api.configurations.getAll();
    const configs = response.data || [];
    const claudeConfig = configs.find(c => c.type === 'claude-md');

    if (!claudeConfig || !claudeConfig.data?.sections) {
      // No configuration found
      document.getElementById('claudeLastUpdate').textContent = 'Never';
      document.getElementById('claudeSections').textContent = '0';
      document.getElementById('claudeCharCount').textContent = '0';
      document.getElementById('claudeStatus').className = 'badge bg-warning';
      document.getElementById('claudeStatus').textContent = 'Not Configured';
      return;
    }

    const sections = claudeConfig.data.sections || [];
    const enabledSections = sections.filter(s => s.enabled !== false);

    // Calculate character count
    let charCount = 0;
    enabledSections.forEach(section => {
      charCount += (section.title || '').length;
      charCount += (section.content || '').length;
    });

    // Update UI
    const lastUpdate = new Date(claudeConfig.updatedAt);
    document.getElementById('claudeLastUpdate').textContent = lastUpdate.toLocaleString();
    document.getElementById('claudeSections').textContent = enabledSections.length;
    document.getElementById('claudeCharCount').textContent = charCount.toLocaleString();

    // Update status badge
    const statusElement = document.getElementById('claudeStatus');
    if (enabledSections.length === 0) {
      statusElement.className = 'badge bg-warning';
      statusElement.textContent = 'Not Configured';
    } else if (enabledSections.length < 3) {
      statusElement.className = 'badge bg-info';
      statusElement.textContent = 'Minimal';
    } else {
      statusElement.className = 'badge bg-success';
      statusElement.textContent = 'Configured';
    }
  } catch (error) {
    console.error('Error loading CLAUDE.md status:', error);
    // Keep default "Not Configured" state
  }
}

/**
 * Load dashboard stats from API
 */
async function loadDashboardStats() {
  try {
    // Fetch all counts in parallel
    const [skillsRes, mcpsRes, agentsRes, templatesRes] = await Promise.all([
      api.skills.getStats(),
      api.mcps.getAll(),
      api.agents.getStats(),
      api.templates.getAll()
    ]);

    // Update stats
    dashboardStats.skills = skillsRes.data?.total || 0;
    dashboardStats.mcps = mcpsRes.count || 0;
    dashboardStats.agents = agentsRes.data?.total || 0;
    dashboardStats.templates = templatesRes.count || 0;

    // Update UI
    document.getElementById('skillCount').textContent = dashboardStats.skills;
    document.getElementById('mcpCount').textContent = dashboardStats.mcps;
    document.getElementById('agentCount').textContent = dashboardStats.agents;
    document.getElementById('templateCount').textContent = dashboardStats.templates;

    // Update detailed stats if elements exist
    updateDetailedStats(skillsRes.data, agentsRes.data);

  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    showToast('Failed to load stats from backend', 'error');
  }
}

/**
 * Update detailed stats breakdown
 */
function updateDetailedStats(skillsData, agentsData) {
  // Skills by category
  const skillsByCategory = document.getElementById('skillsByCategory');
  if (skillsByCategory && skillsData?.byCategory) {
    const items = skillsData.byCategory.map(cat =>
      `<span class="badge bg-secondary me-1">${cat.category}: ${cat._count}</span>`
    ).join('');
    skillsByCategory.innerHTML = items || '<span class="text-muted">No data</span>';
  }

  // Agents by type
  const agentsByType = document.getElementById('agentsByType');
  if (agentsByType && agentsData?.byType) {
    const items = agentsData.byType.map(type =>
      `<span class="badge bg-info me-1">${type.type}: ${type._count}</span>`
    ).join('');
    agentsByType.innerHTML = items || '<span class="text-muted">No data</span>';
  }
}

/**
 * Load recent activity from import history
 */
async function loadRecentActivity() {
  try {
    const response = await api.import.getHistory();
    recentActivity = response.data || [];
    renderRecentActivity();
  } catch (error) {
    console.error('Error loading recent activity:', error);
  }
}

/**
 * Render recent activity timeline
 */
function renderRecentActivity() {
  const container = document.getElementById('recentActivity');
  if (!container) return;

  let html = '';

  // Add import history items
  if (recentActivity.length > 0) {
    recentActivity.slice(0, 5).forEach(item => {
      const date = new Date(item.createdAt);
      const icon = getActivityIcon(item.type);
      const statusClass = item.status === 'success' ? 'bg-success' :
                          item.status === 'partial' ? 'bg-warning' : 'bg-danger';

      html += `
        <div class="timeline-item">
          <div class="timeline-marker ${statusClass}"></div>
          <div>
            <strong><i class="fas ${icon}"></i> ${capitalizeFirst(item.type)} Import</strong>
            <p class="text-muted mb-0">${item.itemCount} item(s) from ${item.source}</p>
            <small class="text-muted">${date.toLocaleString()}</small>
          </div>
        </div>
      `;
    });
  }

  // Add system initialized message
  html += `
    <div class="timeline-item">
      <div class="timeline-marker bg-primary"></div>
      <div>
        <strong><i class="fas fa-rocket"></i> System Ready</strong>
        <p class="text-muted mb-0">Claude Commander v2.0 - API Backend</p>
        <small class="text-muted">${new Date().toLocaleString()}</small>
      </div>
    </div>
  `;

  // Add seeded data info
  html += `
    <div class="timeline-item">
      <div class="timeline-marker bg-info"></div>
      <div>
        <strong><i class="fas fa-database"></i> Data Loaded</strong>
        <p class="text-muted mb-0">${dashboardStats.skills} skills, ${dashboardStats.agents} agents, ${dashboardStats.mcps} MCPs, ${dashboardStats.templates} templates</p>
        <small class="text-muted">From PostgreSQL database</small>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Get icon for activity type
 */
function getActivityIcon(type) {
  const icons = {
    skill: 'fa-wand-magic-sparkles',
    agent: 'fa-users-cog',
    mcp: 'fa-plug',
    template: 'fa-folder-tree'
  };
  return icons[type] || 'fa-file';
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Update date/time display
 */
function updateDateTime() {
  const now = new Date();
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US');
}

/**
 * Export configuration (updated for API)
 */
async function exportConfiguration() {
  try {
    const [skills, agents, mcps, templates] = await Promise.all([
      api.skills.getAll(),
      api.agents.getAll(),
      api.mcps.getAll(),
      api.templates.getAll()
    ]);

    const config = {
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
      skills: skills.data || [],
      agents: agents.data || [],
      mcps: mcps.data || [],
      templates: templates.data || []
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `claude-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showToast('Configuration exported successfully', 'success');
  } catch (error) {
    console.error('Export error:', error);
    showToast('Failed to export configuration', 'error');
  }
}

/**
 * Import configuration
 */
function importConfiguration() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';

  input.onchange = async e => {
    const file = e.target.files[0];
    try {
      const response = await api.import.json(file);
      if (response.success) {
        showToast('Configuration imported successfully', 'success');
        setTimeout(() => location.reload(), 1000);
      } else {
        showToast(response.error || 'Import failed', 'error');
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast('Failed to import configuration', 'error');
    }
  };

  input.click();
}

/**
 * Generate CLAUDE.md file
 */
async function generateClaudeMD() {
  try {
    const response = await api.configurations.getAll();
    const configs = response.data || [];
    const claudeConfig = configs.find(c => c.type === 'claude-md');

    if (!claudeConfig || !claudeConfig.data?.sections) {
      showToast('No CLAUDE.md configuration found. Please build it first.', 'warning');
      return;
    }

    let content = '# CLAUDE.md - Configuration\n\n';
    content += '<!-- Generated by Claude Commander -->\n';
    content += `<!-- Generated on: ${new Date().toISOString()} -->\n\n`;

    claudeConfig.data.sections.forEach(section => {
      content += `## ${section.title}\n\n`;
      content += `${section.content}\n\n`;
    });

    const dataBlob = new Blob([content], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'CLAUDE.md';
    link.click();

    showToast('CLAUDE.md file generated!', 'success');
  } catch (error) {
    console.error('Generate error:', error);
    showToast('Failed to generate CLAUDE.md', 'error');
  }
}

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initDashboard);
}
