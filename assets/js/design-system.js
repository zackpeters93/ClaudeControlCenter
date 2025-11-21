/**
 * Design System Manager - JavaScript
 * Live color editing and preview management
 */

// Current color values
let currentColors = {
    draculaOrchid: '#2d3436',
    cityLights: '#dfe6e9',
    electronBlue: '#0984e3',
    chiGong: '#d63031',
    mintLeaf: '#00b894',
    brightYarrow: '#fdcb6e'
};

// Default American Palette colors
const DEFAULT_COLORS = {
    draculaOrchid: '#2d3436',
    cityLights: '#dfe6e9',
    electronBlue: '#0984e3',
    chiGong: '#d63031',
    mintLeaf: '#00b894',
    brightYarrow: '#fdcb6e'
};

/**
 * Initialize design system manager
 */
function initDesignSystem() {
    loadSavedColors();
    applyColorsToPreview();
}

/**
 * Load saved colors from configuration
 */
function loadSavedColors() {
    const config = loadConfiguration();
    if (config.designSystem && config.designSystem.customColors) {
        currentColors = { ...DEFAULT_COLORS, ...config.designSystem.customColors };
        
        // Update color pickers and swatches
        Object.keys(currentColors).forEach(colorKey => {
            updateColorDisplay(colorKey, currentColors[colorKey]);
        });
    }
}

/**
 * Update color when picker changes
 */
function updateColor(colorKey, hexValue) {
    currentColors[colorKey] = hexValue;
    updateColorDisplay(colorKey, hexValue);
    applyColorsToPreview();
}

/**
 * Update color display (swatch, hex code, border)
 */
function updateColorDisplay(colorKey, hexValue) {
    // Update swatch
    const swatch = document.getElementById(`swatch-${colorKey}`);
    if (swatch) swatch.style.backgroundColor = hexValue;
    
    // Update hex code display
    const hexDisplay = document.getElementById(`hex-${colorKey}`);
    if (hexDisplay) hexDisplay.textContent = hexValue;
    
    // Update card border
    const card = document.getElementById(`card-${colorKey}`);
    if (card) card.style.borderLeftColor = hexValue;
    
    // Update picker value
    const picker = document.getElementById(`picker-${colorKey}`);
    if (picker) picker.value = hexValue;
}

/**
 * Apply current colors to preview components
 */
function applyColorsToPreview() {
    // Buttons
    const btnPrimary = document.getElementById('preview-btn-primary');
    if (btnPrimary) {
        btnPrimary.style.backgroundColor = currentColors.electronBlue;
        btnPrimary.style.borderColor = currentColors.electronBlue;
        btnPrimary.style.color = 'white';
    }
    
    const btnSuccess = document.getElementById('preview-btn-success');
    if (btnSuccess) {
        btnSuccess.style.backgroundColor = currentColors.mintLeaf;
        btnSuccess.style.borderColor = currentColors.mintLeaf;
        btnSuccess.style.color = 'white';
    }
    
    const btnWarning = document.getElementById('preview-btn-warning');
    if (btnWarning) {
        btnWarning.style.backgroundColor = currentColors.brightYarrow;
        btnWarning.style.borderColor = currentColors.brightYarrow;
        btnWarning.style.color = currentColors.draculaOrchid;
    }
    
    const btnDanger = document.getElementById('preview-btn-danger');
    if (btnDanger) {
        btnDanger.style.backgroundColor = currentColors.chiGong;
        btnDanger.style.borderColor = currentColors.chiGong;
        btnDanger.style.color = 'white';
    }
    
    // Cards
    const cardPrimary = document.getElementById('preview-card-primary');
    if (cardPrimary) cardPrimary.style.borderLeftColor = currentColors.electronBlue;
    
    const cardSuccess = document.getElementById('preview-card-success');
    if (cardSuccess) cardSuccess.style.borderLeftColor = currentColors.mintLeaf;
    
    const cardWarning = document.getElementById('preview-card-warning');
    if (cardWarning) cardWarning.style.borderLeftColor = currentColors.brightYarrow;
    
    const cardDanger = document.getElementById('preview-card-danger');
    if (cardDanger) cardDanger.style.borderLeftColor = currentColors.chiGong;
    
    // Alerts
    const alertPrimary = document.getElementById('preview-alert-primary');
    if (alertPrimary) {
        alertPrimary.style.backgroundColor = currentColors.electronBlue;
        alertPrimary.style.color = 'white';
    }
    
    const alertSuccess = document.getElementById('preview-alert-success');
    if (alertSuccess) {
        alertSuccess.style.backgroundColor = currentColors.mintLeaf;
        alertSuccess.style.color = 'white';
    }
    
    const alertWarning = document.getElementById('preview-alert-warning');
    if (alertWarning) {
        alertWarning.style.backgroundColor = currentColors.brightYarrow;
        alertWarning.style.color = currentColors.draculaOrchid;
    }
    
    const alertDanger = document.getElementById('preview-alert-danger');
    if (alertDanger) {
        alertDanger.style.backgroundColor = currentColors.chiGong;
        alertDanger.style.color = 'white';
    }
    
    // Badges
    const badgePrimary = document.getElementById('preview-badge-primary');
    if (badgePrimary) {
        badgePrimary.style.backgroundColor = currentColors.electronBlue;
        badgePrimary.style.color = 'white';
    }
    
    const badgeSuccess = document.getElementById('preview-badge-success');
    if (badgeSuccess) {
        badgeSuccess.style.backgroundColor = currentColors.mintLeaf;
        badgeSuccess.style.color = 'white';
    }
    
    const badgeWarning = document.getElementById('preview-badge-warning');
    if (badgeWarning) {
        badgeWarning.style.backgroundColor = currentColors.brightYarrow;
        badgeWarning.style.color = currentColors.draculaOrchid;
    }
    
    const badgeDanger = document.getElementById('preview-badge-danger');
    if (badgeDanger) {
        badgeDanger.style.backgroundColor = currentColors.chiGong;
        badgeDanger.style.color = 'white';
    }
    
    // Links
    const link = document.getElementById('preview-link');
    if (link) link.style.color = currentColors.electronBlue;
    
    // Dark text
    const textDark = document.getElementById('preview-text-dark');
    if (textDark) textDark.style.color = currentColors.draculaOrchid;
}

/**
 * Save current palette to configuration
 */
function saveCurrentPalette() {
    const config = loadConfiguration();
    
    if (!config.designSystem) {
        config.designSystem = {};
    }
    
    config.designSystem.customColors = { ...currentColors };
    config.designSystem.lastUpdated = new Date().toISOString();
    
    saveConfiguration(config);
    addActivity('Design System Updated', 'Custom color palette saved');
    showToast('Color palette saved successfully!', 'success');
}

/**
 * Reset to default American Palette
 */
function resetToDefault() {
    if (!confirm('Reset all colors to default American Palette?')) return;
    
    currentColors = { ...DEFAULT_COLORS };
    
    // Update all displays
    Object.keys(currentColors).forEach(colorKey => {
        updateColorDisplay(colorKey, currentColors[colorKey]);
    });
    
    applyColorsToPreview();
    showToast('Reset to default colors', 'info');
}
/**
 * Export CSS with current colors
 */
function exportCSS() {
    const cssContent = `/*
 * Custom Color Palette - Generated by Claude Control Center
 * Generated: ${new Date().toLocaleString()}
 */

:root {
  /* Primary Colors */
  --dracula-orchid: ${currentColors.draculaOrchid};
  --city-lights: ${currentColors.cityLights};
  --electron-blue: ${currentColors.electronBlue};
  --chi-gong: ${currentColors.chiGong};
  
  /* Secondary Colors */
  --mint-leaf: ${currentColors.mintLeaf};
  --bright-yarrow: ${currentColors.brightYarrow};
  
  /* Functional Colors */
  --bg-dark: var(--dracula-orchid);
  --bg-light: var(--city-lights);
  --primary: var(--electron-blue);
  --danger: var(--chi-gong);
  --success: var(--mint-leaf);
  --warning: var(--bright-yarrow);
}

/* Buttons */
.btn-primary {
  background-color: var(--primary);
  border-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary);
  opacity: 0.9;
}

.btn-success {
  background-color: var(--success);
  border-color: var(--success);
  color: white;
}

.btn-warning {
  background-color: var(--warning);
  border-color: var(--warning);
  color: var(--bg-dark);
}

.btn-danger {
  background-color: var(--danger);
  border-color: var(--danger);
  color: white;
}

/* Cards */
.stat-card {
  border-left: 4px solid var(--primary);
}

.stat-card.success {
  border-left-color: var(--success);
}

.stat-card.warning {
  border-left-color: var(--warning);
}

.stat-card.danger {
  border-left-color: var(--danger);
}

/* Links */
a {
  color: var(--primary);
  text-decoration: none;
}

a:hover {
  color: var(--primary);
  opacity: 0.8;
}

/* Text Colors */
.text-primary { color: var(--primary) !important; }
.text-success { color: var(--success) !important; }
.text-warning { color: var(--warning) !important; }
.text-danger { color: var(--danger) !important; }

/* Background Colors */
.bg-primary { background-color: var(--primary) !important; }
.bg-success { background-color: var(--success) !important; }
.bg-warning { background-color: var(--warning) !important; }
.bg-danger { background-color: var(--danger) !important; }

/* Badges */
.badge-primary { background-color: var(--primary); }
.badge-success { background-color: var(--success); }
.badge-warning { background-color: var(--warning); color: var(--bg-dark); }
.badge-danger { background-color: var(--danger); }

/* IMPORTANT: Flat Design Only - NO GRADIENTS */
/* All backgrounds must be solid colors */
`;

    // Create download
    const blob = new Blob([cssContent], { type: 'text/css' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'custom-colors.css';
    link.click();
    
    addActivity('CSS Exported', 'Custom color CSS file downloaded');
    showToast('CSS file downloaded!', 'success');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const colors = {
        success: currentColors.mintLeaf,
        info: currentColors.electronBlue,
        warning: currentColors.brightYarrow,
        danger: currentColors.chiGong
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
    toast.style.color = type === 'warning' ? currentColors.draculaOrchid : 'white';
    toast.style.minWidth = '300px';
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
    document.addEventListener('DOMContentLoaded', initDesignSystem);
}
