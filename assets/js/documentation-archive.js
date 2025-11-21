/**
 * Documentation Archive - JavaScript
 * Manage configuration snapshots and history
 * Now uses PostgreSQL API instead of localStorage
 */

let currentArchive = null;
let archivesCache = [];

/**
 * Initialize Documentation Archive
 */
async function initDocumentationArchive() {
    await loadArchives();
    await updateStats();
}

/**
 * Load archives from API
 */
async function loadArchives() {
    try {
        const response = await api.archives.getAll();
        archivesCache = response.data || [];
        renderArchives();
    } catch (error) {
        console.error('Error loading archives:', error);
        archivesCache = [];
        renderArchives();
    }
}

/**
 * Create a new snapshot of current configuration
 */
async function createSnapshot() {
    try {
        const config = loadConfiguration();

        const response = await api.archives.create({
            version: config.version || '1.0.0',
            data: config,
            note: 'Auto-generated snapshot'
        });

        if (response.success) {
            await loadArchives();
            await updateStats();
            showToast('Snapshot created successfully!', 'success');
            if (typeof addActivity !== 'undefined') {
                addActivity('Snapshot Created', 'Configuration snapshot saved to database');
            }
        }
    } catch (error) {
        console.error('Error creating snapshot:', error);
        showToast('Failed to create snapshot', 'danger');
    }
}

/**
 * Get all archives (from cache)
 */
function getArchives() {
    return archivesCache;
}

/**
 * Render archives list
 */
function renderArchives() {
    const container = document.getElementById('archivesList');
    const archives = getArchives();

    if (archives.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>No snapshots yet. Create one to start tracking configuration history.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    archives.forEach((archive, index) => {
        const card = document.createElement('div');
        card.className = 'card archive-card mb-3';
        card.onclick = () => showArchiveDetail(archive);

        const date = new Date(archive.createdAt);
        const formattedDate = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const isCurrent = index === 0;
        const versionBadge = isCurrent
            ? '<span class="badge bg-success version-badge">Current</span>'
            : `<span class="badge bg-secondary version-badge">v${archive.version}</span>`;

        const configSize = JSON.stringify(archive.data).length;
        const sizeKB = (configSize / 1024).toFixed(2);

        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">
                            <i class="fas fa-archive text-primary"></i>
                            Snapshot ${archives.length - index}
                            ${versionBadge}
                        </h6>
                        <p class="timestamp mb-1">
                            <i class="fas fa-clock"></i> ${formattedDate}
                        </p>
                        <small class="text-muted">
                            ${archive.data?.claude?.sections?.length || 0} sections ·
                            ${sizeKB} KB
                        </small>
                    </div>
                    <div class="text-end">
                        <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); downloadArchive('${archive.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        ${!isCurrent ? `
                        <button class="btn btn-sm btn-outline-success" onclick="event.stopPropagation(); restoreArchive('${archive.id}')">
                            <i class="fas fa-undo"></i>
                        </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteArchive('${archive.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

/**
 * Show archive detail modal
 */
function showArchiveDetail(archive) {
    currentArchive = archive;

    const date = new Date(archive.createdAt);
    const formattedDate = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('modalArchiveTitle').textContent = `Snapshot from ${formattedDate}`;

    const configSize = JSON.stringify(archive.data).length;
    const sizeKB = (configSize / 1024).toFixed(2);

    const content = `
        <div class="mb-3">
            <span class="badge bg-secondary">Version ${archive.version}</span>
            <span class="badge bg-info ms-2">${sizeKB} KB</span>
            <span class="badge bg-success ms-2">${archive.data?.claude?.sections?.length || 0} Sections</span>
        </div>

        <hr>

        <h6><i class="fas fa-info-circle"></i> Configuration Details</h6>
        <table class="table table-sm">
            <tbody>
                <tr>
                    <td><strong>Timestamp:</strong></td>
                    <td>${archive.createdAt}</td>
                </tr>
                <tr>
                    <td><strong>Version:</strong></td>
                    <td>${archive.version}</td>
                </tr>
                <tr>
                    <td><strong>CLAUDE.md Sections:</strong></td>
                    <td>${archive.data?.claude?.sections?.length || 0}</td>
                </tr>
                <tr>
                    <td><strong>Skills Defined:</strong></td>
                    <td>${archive.data?.skills?.length || 0}</td>
                </tr>
                <tr>
                    <td><strong>Agents Defined:</strong></td>
                    <td>${archive.data?.agents?.length || 0}</td>
                </tr>
                <tr>
                    <td><strong>Templates:</strong></td>
                    <td>${archive.data?.templates?.length || 0}</td>
                </tr>
            </tbody>
        </table>

        <hr>

        <h6><i class="fas fa-list"></i> CLAUDE.md Sections</h6>
        ${archive.data?.claude?.sections?.length > 0 ? `
            <ul class="small">
                ${archive.data.claude.sections.map(s => `<li>${s.title}</li>`).join('')}
            </ul>
        ` : '<p class="text-muted small">No sections configured</p>'}
    `;

    document.getElementById('modalArchiveContent').innerHTML = content;

    // Setup action buttons
    document.getElementById('downloadArchiveBtn').onclick = () => downloadArchive(archive.id);
    document.getElementById('restoreArchiveBtn').onclick = () => {
        restoreArchive(archive.id);
        bootstrap.Modal.getInstance(document.getElementById('archiveDetailModal')).hide();
    };

    const modal = new bootstrap.Modal(document.getElementById('archiveDetailModal'));
    modal.show();
}

/**
 * Download archive as JSON file
 */
function downloadArchive(archiveId) {
    const archives = getArchives();
    const archive = archives.find(a => a.id === archiveId);

    if (!archive) {
        showToast('Archive not found', 'danger');
        return;
    }

    const dataStr = JSON.stringify(archive.data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const date = new Date(archive.createdAt);
    const dateStr = date.toISOString().split('T')[0];

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `claude-config-${dateStr}.json`;
    link.click();

    showToast('Archive downloaded', 'success');
}

/**
 * Restore configuration from archive
 */
async function restoreArchive(archiveId) {
    if (!confirm('Are you sure you want to restore this configuration? Current configuration will be replaced.')) {
        return;
    }

    const archives = getArchives();
    const archive = archives.find(a => a.id === archiveId);

    if (!archive) {
        showToast('Archive not found', 'danger');
        return;
    }

    // Create snapshot of current config before restoring
    await createSnapshot();

    // Restore the archived configuration
    saveConfiguration(archive.data);

    showToast('Configuration restored successfully!', 'success');
    if (typeof addActivity !== 'undefined') {
        addActivity('Configuration Restored', `Restored from ${new Date(archive.createdAt).toLocaleString()}`);
    }

    // Reload page to reflect changes
    setTimeout(() => {
        location.reload();
    }, 1500);
}

/**
 * Delete an archive
 */
async function deleteArchive(archiveId) {
    if (!confirm('Are you sure you want to delete this snapshot?')) {
        return;
    }

    try {
        await api.archives.delete(archiveId);
        await loadArchives();
        await updateStats();
        showToast('Snapshot deleted', 'info');
    } catch (error) {
        console.error('Error deleting archive:', error);
        showToast('Failed to delete snapshot', 'danger');
    }
}

/**
 * Update statistics
 */
async function updateStats() {
    try {
        const response = await api.archives.getStats();
        const stats = response.data || {};

        document.getElementById('totalSnapshots').textContent = stats.totalSnapshots || 0;
        document.getElementById('currentVersion').textContent = stats.currentVersion || '1.0.0';
        document.getElementById('totalSize').textContent = (stats.totalSizeKB || '0') + ' KB';
        document.getElementById('lastBackup').textContent = stats.lastBackup
            ? formatDate(stats.lastBackup)
            : 'Never';
    } catch (error) {
        console.error('Error loading stats:', error);
        // Fallback to local calculation
        const archives = getArchives();
        const config = loadConfiguration();

        document.getElementById('totalSnapshots').textContent = archives.length;
        document.getElementById('currentVersion').textContent = config.version || '1.0.0';
        document.getElementById('totalSize').textContent = '0 KB';
        document.getElementById('lastBackup').textContent = 'Never';
    }
}

/**
 * Format date for display
 */
function formatDate(isoDate) {
    if (!isoDate) return 'Never';
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
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
    document.addEventListener('DOMContentLoaded', initDocumentationArchive);
}
