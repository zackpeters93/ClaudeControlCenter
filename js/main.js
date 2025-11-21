// Claude Control Center - Main JavaScript
// Navigation and Core Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-link');
    const viewContents = document.querySelectorAll('.view-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and views
            navLinks.forEach(l => l.classList.remove('active'));
            viewContents.forEach(v => v.style.display = 'none');
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding view
            const viewName = this.getAttribute('data-view');
            const viewElement = document.getElementById(`view-${viewName}`);
            if (viewElement) {
                viewElement.style.display = 'block';
            }
        });
    });
    
    // Button handlers
    document.getElementById('saveBtn').addEventListener('click', function() {
        alert('Save functionality coming in Phase 2!');
    });
    
    document.getElementById('exportBtn').addEventListener('click', function() {
        alert('Export functionality coming in Phase 2!');
    });
    
    document.getElementById('archiveBtn').addEventListener('click', function() {
        alert('Archive functionality coming in Phase 2!');
    });
    
    // Load theme data
    loadThemeData();
});

// Load theme configuration
function loadThemeData() {
    // This would fetch from data/colors.json in a real implementation
    console.log('Theme data loaded: American Palette');
}

// Utility functions for future phases
function saveConfiguration() {
    console.log('Saving configuration...');
}

function exportCLAUDEmd() {
    console.log('Exporting CLAUDE.md...');
}

function archiveVersion() {
    const timestamp = new Date().toISOString().split('T')[0];
    console.log(`Creating archive: archive/index_${timestamp}_001.html`);
}
