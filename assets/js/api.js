/**
 * API Client - Centralized HTTP client for backend communication
 * Requires: Axios (loaded via CDN)
 */

const API_BASE_URL = 'http://localhost:3000/api';

class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;

        // Check if axios is loaded
        if (typeof axios === 'undefined') {
            console.error('Axios is not loaded. Please include Axios CDN in your HTML.');
            throw new Error('Axios is required for API client');
        }

        // Create axios instance
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            response => response,
            error => {
                console.error('API Error:', error);

                // Extract error message
                const message = error.response?.data?.error
                    || error.message
                    || 'An unknown error occurred';

                // Show toast if available
                if (typeof showToast !== 'undefined') {
                    showToast(message, 'error');
                }

                return Promise.reject(error);
            }
        );
    }

    // Generic HTTP methods
    async get(endpoint, params = {}) {
        try {
            const response = await this.client.get(endpoint, { params });
            return response.data;
        } catch (error) {
            throw this._formatError(error);
        }
    }

    async post(endpoint, data = {}) {
        try {
            const response = await this.client.post(endpoint, data);
            if (typeof showToast !== 'undefined' && response.data.success) {
                showToast('Operation successful', 'success');
            }
            return response.data;
        } catch (error) {
            throw this._formatError(error);
        }
    }

    async put(endpoint, data = {}) {
        try {
            const response = await this.client.put(endpoint, data);
            if (typeof showToast !== 'undefined' && response.data.success) {
                showToast('Update successful', 'success');
            }
            return response.data;
        } catch (error) {
            throw this._formatError(error);
        }
    }

    async patch(endpoint, data = {}) {
        try {
            const response = await this.client.patch(endpoint, data);
            if (typeof showToast !== 'undefined' && response.data.success) {
                showToast('Update successful', 'success');
            }
            return response.data;
        } catch (error) {
            throw this._formatError(error);
        }
    }

    async delete(endpoint) {
        try {
            const response = await this.client.delete(endpoint);
            if (typeof showToast !== 'undefined' && response.data.success) {
                showToast('Deleted successfully', 'success');
            }
            return response.data;
        } catch (error) {
            throw this._formatError(error);
        }
    }

    // Skills API
    skills = {
        getAll: (filters = {}) => this.get('/skills', filters),
        getById: (id) => this.get(`/skills/${id}`),
        getStats: () => this.get('/skills/stats'),
        create: (data) => this.post('/skills', data),
        update: (id, data) => this.put(`/skills/${id}`, data),
        delete: (id) => this.delete(`/skills/${id}`),
        search: (query) => this.post('/skills/search', { query }),
        toggleFavorite: (id) => this.patch(`/skills/${id}/favorite`),
        incrementUsage: (id) => this.patch(`/skills/${id}/usage`)
    };

    // Agents API
    agents = {
        getAll: (filters = {}) => this.get('/agents', filters),
        getById: (id) => this.get(`/agents/${id}`),
        getStats: () => this.get('/agents/stats'),
        create: (data) => this.post('/agents', data),
        update: (id, data) => this.put(`/agents/${id}`, data),
        delete: (id) => this.delete(`/agents/${id}`),
        search: (query) => this.post('/agents/search', { query }),
        incrementUsage: (id) => this.patch(`/agents/${id}/usage`)
    };

    // MCPs API
    mcps = {
        getAll: (filters = {}) => this.get('/mcps', filters),
        getById: (id) => this.get(`/mcps/${id}`),
        create: (data) => this.post('/mcps', data),
        update: (id, data) => this.put(`/mcps/${id}`, data),
        delete: (id) => this.delete(`/mcps/${id}`),
        toggleStatus: (id) => this.patch(`/mcps/${id}/status`)
    };

    // Templates API
    templates = {
        getAll: (filters = {}) => this.get('/templates', filters),
        getById: (id) => this.get(`/templates/${id}`),
        create: (data) => this.post('/templates', data),
        update: (id, data) => this.put(`/templates/${id}`, data),
        delete: (id) => this.delete(`/templates/${id}`),
        export: (id) => this.get(`/templates/${id}/export`)
    };

    // Configurations API
    configurations = {
        getAll: () => this.get('/configurations'),
        getById: (id) => this.get(`/configurations/${id}`),
        create: (data) => this.post('/configurations', data),
        update: (id, data) => this.put(`/configurations/${id}`, data),
        delete: (id) => this.delete(`/configurations/${id}`),
        createSnapshot: (id, description) => this.post(`/configurations/${id}/snapshots`, { description }),
        restoreSnapshot: (configId, snapshotId) => this.post(`/configurations/${configId}/snapshots/${snapshotId}/restore`),
        export: (id) => this.get(`/configurations/${id}/export`)
    };

    // Search API
    search = {
        local: (query, type = null) => this.post('/search/local', { query, type }),
        external: (query) => this.post('/search/external', { query }),
        anthropic: (query) => this.post('/search/anthropic', { query })
    };

    // Import API
    import = {
        json: (file) => {
            const formData = new FormData();
            formData.append('file', file);
            return this.client.post('/import/json', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(res => res.data);
        },
        url: (url) => this.post('/import/url', { url }),
        github: (repo, path) => this.post('/import/github', { repo, path }),
        bulk: (sources) => this.post('/import/bulk', { sources }),
        getHistory: () => this.get('/import/history')
    };

    // Archives API (Documentation Archive)
    archives = {
        getAll: () => this.get('/archives'),
        getById: (id) => this.get(`/archives/${id}`),
        getStats: () => this.get('/archives/stats'),
        create: (data) => this.post('/archives', data),
        delete: (id) => this.delete(`/archives/${id}`)
    };

    // Health check
    health = {
        check: () => this.get('/health')
    };

    // Helper to format errors
    _formatError(error) {
        if (error.response) {
            return {
                status: error.response.status,
                message: error.response.data?.error || error.message,
                data: error.response.data
            };
        }
        return {
            status: 0,
            message: error.message || 'Network error',
            data: null
        };
    }
}

// Create singleton instance
const api = new APIClient();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}
