let allArticles = [];
let filteredArticles = [];
let articleToDelete = null;

// DOM Elements
const articlesTableBody = document.getElementById('articles-tbody');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const emptyState = document.getElementById('empty-state');
const tableContainer = document.querySelector('.table-container');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const categoryFilter = document.getElementById('category-filter');
const deleteModal = document.getElementById('delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadArticles();
    setupEventListeners();
});

function setupEventListeners() {
    searchInput.addEventListener('input', filterArticles);
    statusFilter.addEventListener('change', filterArticles);
    categoryFilter.addEventListener('change', filterArticles);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', deleteArticle);
}

async function loadCategories() {
    try {
        const categories = await api.getCategories();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function loadArticles() {
    try {
        loadingMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        tableContainer.style.display = 'none';
        emptyState.style.display = 'none';

        allArticles = await api.getAllArticles();
        filteredArticles = [...allArticles];

        loadingMessage.style.display = 'none';

        if (allArticles.length === 0) {
            emptyState.style.display = 'block';
        } else {
            tableContainer.style.display = 'block';
            renderArticles();
        }
    } catch (error) {
        console.error('Failed to load articles:', error);
        loadingMessage.style.display = 'none';
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Failed to load articles. Please try again.';
    }
}

function filterArticles() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const categoryValue = categoryFilter.value;

    filteredArticles = allArticles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm) ||
                            (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm));
        const matchesStatus = !statusValue || article.status === statusValue;
        const matchesCategory = !categoryValue || article.category_id == categoryValue;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    renderArticles();
}

function renderArticles() {
    articlesTableBody.innerHTML = '';

    if (filteredArticles.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center; padding: 2rem;">No articles found matching your filters.</td>';
        articlesTableBody.appendChild(row);
        return;
    }

    filteredArticles.forEach(article => {
        const row = document.createElement('tr');

        const date = article.date_published
            ? new Date(article.date_published).toLocaleDateString()
            : new Date(article.created_at).toLocaleDateString();

        row.innerHTML = `
            <td>
                <strong>${escapeHtml(article.title)}</strong>
                ${article.excerpt ? `<br><small style="color: #6c757d;">${escapeHtml(article.excerpt.substring(0, 80))}...</small>` : ''}
            </td>
            <td>${escapeHtml(article.category_name || 'Uncategorized')}</td>
            <td>
                <span class="status-badge status-${article.status}">
                    ${article.status}
                </span>
            </td>
            <td>${article.views || 0}</td>
            <td>${date}</td>
            <td>
                <div class="article-actions">
                    <a href="edit-article.html?id=${article.id}" class="btn btn-secondary btn-small" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </a>
                    <button onclick="openDeleteModal(${article.id})" class="btn btn-danger btn-small" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        articlesTableBody.appendChild(row);
    });
}

function openDeleteModal(articleId) {
    articleToDelete = articleId;
    deleteModal.style.display = 'flex';
}

function closeDeleteModal() {
    articleToDelete = null;
    deleteModal.style.display = 'none';
}

async function deleteArticle() {
    if (!articleToDelete) return;

    try {
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = 'Deleting...';

        await api.deleteArticle(articleToDelete);

        // Remove from local arrays
        allArticles = allArticles.filter(a => a.id !== articleToDelete);
        filteredArticles = filteredArticles.filter(a => a.id !== articleToDelete);

        closeDeleteModal();
        renderArticles();

        // Show success message
        showSuccessMessage('Article deleted successfully');
    } catch (error) {
        console.error('Failed to delete article:', error);
        alert('Failed to delete article. Please try again.');
    } finally {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Delete';
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #d4edda;
        color: #155724;
        padding: 1.5rem 2rem;
        border-radius: 0.4rem;
        border: 1px solid #c3e6cb;
        font-size: 1.4rem;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make function available globally for onclick
window.openDeleteModal = openDeleteModal;
