/**
 * Toast Notification System
 * American Palette styled notifications
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container position-fixed top-0 end-0 p-3';
            this.container.style.zIndex = '9999';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', duration = 4000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);

        // Bootstrap toast instance
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: duration
        });

        bsToast.show();

        // Remove from DOM after hide
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });

        return toast;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        const config = this.getTypeConfig(type);

        toast.innerHTML = `
            <div class="toast-header" style="background-color: ${config.bgColor}; color: white; border: none;">
                <i class="${config.icon} me-2"></i>
                <strong class="me-auto">${config.title}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body" style="background-color: #dfe6e9;">
                ${this.escapeHtml(message)}
            </div>
        `;

        return toast;
    }

    getTypeConfig(type) {
        const configs = {
            success: {
                icon: 'fas fa-check-circle',
                title: 'Success',
                bgColor: '#00b894' // Mint Leaf
            },
            error: {
                icon: 'fas fa-exclamation-circle',
                title: 'Error',
                bgColor: '#d63031' // Chi-Gong
            },
            warning: {
                icon: 'fas fa-exclamation-triangle',
                title: 'Warning',
                bgColor: '#fdcb6e' // Bright Yarrow
            },
            info: {
                icon: 'fas fa-info-circle',
                title: 'Info',
                bgColor: '#0984e3' // Electron Blue
            }
        };

        return configs[type] || configs.info;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Convenience methods
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Create singleton instance
const toastManager = new ToastManager();

// Global helper function
function showToast(message, type = 'info', duration = 4000) {
    return toastManager.show(message, type, duration);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToastManager, toastManager, showToast };
}
