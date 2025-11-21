/**
 * Modal Manager - Reusable modal components and utilities
 * American Palette styled modals
 */

class ModalManager {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
    }

    /**
     * Create a confirmation dialog
     * @param {Object} options - { title, message, confirmText, cancelText, onConfirm, onCancel }
     */
    confirm(options = {}) {
        const defaults = {
            title: 'Confirm Action',
            message: 'Are you sure you want to proceed?',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            confirmColor: '#d63031', // Chi-Gong (red)
            onConfirm: () => {},
            onCancel: () => {}
        };

        const config = { ...defaults, ...options };

        const modalHtml = `
            <div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border: none; border-radius: 12px;">
                        <div class="modal-header" style="background-color: #2d3436; color: white; border: none;">
                            <h5 class="modal-title">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                ${this.escapeHtml(config.title)}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" style="background-color: #dfe6e9; padding: 2rem;">
                            <p class="mb-0" style="color: #2d3436; font-size: 1.1rem;">
                                ${this.escapeHtml(config.message)}
                            </p>
                        </div>
                        <div class="modal-footer" style="background-color: #dfe6e9; border: none;">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                ${this.escapeHtml(config.cancelText)}
                            </button>
                            <button type="button" class="btn" id="confirmBtn"
                                style="background-color: ${config.confirmColor}; color: white;">
                                ${this.escapeHtml(config.confirmText)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing confirm modal if any
        const existing = document.getElementById('confirmModal');
        if (existing) existing.remove();

        // Add to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalEl = document.getElementById('confirmModal');
        const modal = new bootstrap.Modal(modalEl);

        // Handle confirm button
        modalEl.querySelector('#confirmBtn').addEventListener('click', () => {
            config.onConfirm();
            modal.hide();
        });

        // Handle cancel
        modalEl.addEventListener('hidden.bs.modal', () => {
            modalEl.remove();
        });

        modal.show();
        return modal;
    }

    /**
     * Create a form modal
     * @param {Object} options - { title, fields, data, onSubmit, submitText }
     */
    form(options = {}) {
        const defaults = {
            title: 'Form',
            fields: [],
            data: {},
            onSubmit: () => {},
            submitText: 'Save',
            size: 'modal-lg' // or 'modal-xl', 'modal-sm'
        };

        const config = { ...defaults, ...options };
        const modalId = `formModal_${Date.now()}`;

        const fieldsHtml = config.fields.map(field => this.renderField(field, config.data)).join('');

        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog ${config.size} modal-dialog-scrollable">
                    <div class="modal-content" style="border: none; border-radius: 12px; max-height: 90vh;">
                        <div class="modal-header" style="background-color: #0984e3; color: white; border: none;">
                            <h5 class="modal-title">
                                <i class="fas fa-edit me-2"></i>
                                ${this.escapeHtml(config.title)}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="${modalId}_form">
                            <div class="modal-body" style="background-color: #dfe6e9; max-height: calc(90vh - 140px); overflow-y: auto;">
                                ${fieldsHtml}
                            </div>
                            <div class="modal-footer" style="background-color: #dfe6e9; border: none;">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    Cancel
                                </button>
                                <button type="submit" class="btn" style="background-color: #00b894; color: white;">
                                    <i class="fas fa-save me-2"></i>${this.escapeHtml(config.submitText)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal with same ID if any
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        // Add to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalEl = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalEl);

        // Handle form submission
        const form = document.getElementById(`${modalId}_form`);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = this.getFormData(form, config.fields);
            config.onSubmit(formData);
            modal.hide();
        });

        // Cleanup on hide
        modalEl.addEventListener('hidden.bs.modal', () => {
            modalEl.remove();
        });

        modal.show();
        this.activeModal = modal;
        return modal;
    }

    /**
     * Render a form field based on type
     */
    renderField(field, data = {}) {
        const value = data[field.name] || field.default || '';
        const required = field.required ? 'required' : '';
        const placeholder = field.placeholder || '';

        let inputHtml = '';

        switch (field.type) {
            case 'text':
            case 'email':
            case 'url':
            case 'number':
                inputHtml = `
                    <input type="${field.type}"
                           class="form-control"
                           id="${field.name}"
                           name="${field.name}"
                           value="${this.escapeHtml(value)}"
                           placeholder="${this.escapeHtml(placeholder)}"
                           ${required}>
                `;
                break;

            case 'textarea':
                const rows = field.rows || 3;
                inputHtml = `
                    <textarea class="form-control"
                              id="${field.name}"
                              name="${field.name}"
                              rows="${rows}"
                              placeholder="${this.escapeHtml(placeholder)}"
                              ${required}>${this.escapeHtml(value)}</textarea>
                `;
                break;

            case 'select':
                const options = (field.options || []).map(opt => {
                    const selected = opt.value === value ? 'selected' : '';
                    return `<option value="${this.escapeHtml(opt.value)}" ${selected}>${this.escapeHtml(opt.label)}</option>`;
                }).join('');
                inputHtml = `
                    <select class="form-select"
                            id="${field.name}"
                            name="${field.name}"
                            ${required}>
                        ${options}
                    </select>
                `;
                break;

            case 'checkbox':
                const checked = value ? 'checked' : '';
                inputHtml = `
                    <div class="form-check">
                        <input type="checkbox"
                               class="form-check-input"
                               id="${field.name}"
                               name="${field.name}"
                               ${checked}>
                        <label class="form-check-label" for="${field.name}">
                            ${this.escapeHtml(field.checkboxLabel || field.label)}
                        </label>
                    </div>
                `;
                break;

            case 'color':
                inputHtml = `
                    <input type="color"
                           class="form-control form-control-color"
                           id="${field.name}"
                           name="${field.name}"
                           value="${value || '#0984e3'}"
                           ${required}>
                `;
                break;

            case 'json':
                const jsonValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
                inputHtml = `
                    <textarea class="form-control font-monospace"
                              id="${field.name}"
                              name="${field.name}"
                              rows="${field.rows || 5}"
                              placeholder="${this.escapeHtml(placeholder)}"
                              ${required}>${this.escapeHtml(jsonValue)}</textarea>
                `;
                break;

            case 'tags':
                const tags = Array.isArray(value) ? value : (value ? value.split(',') : []);
                const tagsValue = tags.join(', ');
                inputHtml = `
                    <input type="text"
                           class="form-control"
                           id="${field.name}"
                           name="${field.name}"
                           value="${this.escapeHtml(tagsValue)}"
                           placeholder="${this.escapeHtml(placeholder || 'Enter tags separated by commas')}"
                           ${required}>
                    <small class="form-text text-muted">Separate multiple values with commas</small>
                `;
                break;

            default:
                inputHtml = `<p class="text-danger">Unknown field type: ${field.type}</p>`;
        }

        return `
            <div class="mb-3">
                ${field.type !== 'checkbox' ? `
                    <label for="${field.name}" class="form-label fw-bold" style="color: #2d3436;">
                        ${this.escapeHtml(field.label)}
                        ${field.required ? '<span class="text-danger">*</span>' : ''}
                    </label>
                ` : ''}
                ${inputHtml}
                ${field.help ? `<small class="form-text text-muted">${this.escapeHtml(field.help)}</small>` : ''}
            </div>
        `;
    }

    /**
     * Extract form data
     */
    getFormData(form, fields) {
        const formData = new FormData(form);
        const data = {};

        fields.forEach(field => {
            if (field.type === 'checkbox') {
                data[field.name] = form.querySelector(`#${field.name}`).checked;
            } else if (field.type === 'json') {
                try {
                    data[field.name] = JSON.parse(formData.get(field.name));
                } catch (e) {
                    data[field.name] = formData.get(field.name);
                }
            } else if (field.type === 'tags') {
                const value = formData.get(field.name);
                data[field.name] = value ? value.split(',').map(v => v.trim()).filter(v => v) : [];
            } else if (field.type === 'number') {
                const value = formData.get(field.name);
                data[field.name] = value ? Number(value) : null;
            } else {
                data[field.name] = formData.get(field.name);
            }
        });

        return data;
    }

    /**
     * Close active modal
     */
    close() {
        if (this.activeModal) {
            this.activeModal.hide();
            this.activeModal = null;
        }
    }

    /**
     * HTML escape utility
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create singleton instance
const modalManager = new ModalManager();

// Global helper functions
function showConfirm(options) {
    return modalManager.confirm(options);
}

function showFormModal(options) {
    return modalManager.form(options);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalManager, modalManager, showConfirm, showFormModal };
}
