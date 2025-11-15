// API client for blog backend
const API_BASE_URL = 'http://localhost:3000/api';

class BlogAPI {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }

    // Helper method for making API calls
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.token) {
            this.token = data.token;
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    }

    async logout() {
        const sessionId = localStorage.getItem('session_id');

        try {
            await this.request('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ sessionId })
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.token = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.removeItem('session_id');
        }
    }

    async verifyToken() {
        return await this.request('/auth/verify');
    }

    async changePassword(currentPassword, newPassword) {
        return await this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    // Articles
    async getArticles(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/articles?${queryString}` : '/articles';
        return await this.request(endpoint);
    }

    async getArticle(slug) {
        return await this.request(`/articles/${slug}`);
    }

    async getAllArticles() {
        return await this.request('/articles/admin/all');
    }

    async createArticle(articleData) {
        return await this.request('/articles', {
            method: 'POST',
            body: JSON.stringify(articleData)
        });
    }

    async updateArticle(id, articleData) {
        return await this.request(`/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(articleData)
        });
    }

    async deleteArticle(id) {
        return await this.request(`/articles/${id}`, {
            method: 'DELETE'
        });
    }

    // Categories
    async getCategories() {
        return await this.request('/categories');
    }

    async getCategory(slug) {
        return await this.request(`/categories/${slug}`);
    }

    async createCategory(categoryData) {
        return await this.request('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    }

    async updateCategory(id, categoryData) {
        return await this.request(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData)
        });
    }

    async deleteCategory(id) {
        return await this.request(`/categories/${id}`, {
            method: 'DELETE'
        });
    }

    // Tags
    async getTags() {
        return await this.request('/tags');
    }

    async createTag(tagData) {
        return await this.request('/tags', {
            method: 'POST',
            body: JSON.stringify(tagData)
        });
    }

    async addTagToArticle(articleId, tagId) {
        return await this.request(`/tags/article/${articleId}`, {
            method: 'POST',
            body: JSON.stringify({ tag_id: tagId })
        });
    }

    async removeTagFromArticle(articleId, tagId) {
        return await this.request(`/tags/article/${articleId}/${tagId}`, {
            method: 'DELETE'
        });
    }

    async deleteTag(id) {
        return await this.request(`/tags/${id}`, {
            method: 'DELETE'
        });
    }

    // Comments
    async getComments(articleId) {
        return await this.request(`/comments/article/${articleId}`);
    }

    async getAllComments() {
        return await this.request('/comments/admin/all');
    }

    async createComment(commentData) {
        return await this.request('/comments', {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
    }

    async updateCommentStatus(id, status) {
        return await this.request(`/comments/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    async deleteComment(id) {
        return await this.request(`/comments/${id}`, {
            method: 'DELETE'
        });
    }

    // Image Upload
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        const url = `${API_BASE_URL}/upload/image`;
        const headers = {};

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Image upload failed');
            }

            return data;
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    }

    async deleteImage(filename) {
        return await this.request(`/upload/image/${filename}`, {
            method: 'DELETE'
        });
    }

    // About Page
    async getAboutPage() {
        return await this.request('/about');
    }

    async updateAboutPage(aboutData) {
        return await this.request('/about', {
            method: 'PUT',
            body: JSON.stringify(aboutData)
        });
    }
}

// Create a global instance
const api = new BlogAPI();
