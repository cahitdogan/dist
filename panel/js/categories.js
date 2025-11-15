let allCategories = [];
let editingCategoryId = null;

// DOM Elements
const categoriesTableBody = document.getElementById('categories-tbody');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const emptyState = document.getElementById('empty-state');
const tableContainer = document.querySelector('.table-container');

// Modal elements
const categoryModal = document.getElementById('category-modal');
const categoryForm = document.getElementById('category-form');
const modalTitle = document.getElementById('modal-title');
const submitText = document.getElementById('submit-text');
const categoryNameInput = document.getElementById('category-name');
const categorySlugInput = document.getElementById('category-slug');
const categoryDescInput = document.getElementById('category-description');
const addCategoryBtn = document.getElementById('add-category-btn');
const cancelCategoryBtn = document.getElementById('cancel-category');

// Delete modal elements
const deleteModal = document.getElementById('delete-modal');
const deleteMessage = document.getElementById('delete-message');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
let categoryToDelete = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    setupEventListeners();
});

function setupEventListeners() {
    addCategoryBtn.addEventListener('click', openAddModal);
    cancelCategoryBtn.addEventListener('click', closeModal);
    categoryForm.addEventListener('submit', handleSubmit);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', deleteCategory);

    // Auto-generate slug from name
    categoryNameInput.addEventListener('input', () => {
        if (!categorySlugInput.dataset.manuallyEdited) {
            categorySlugInput.value = generateSlug(categoryNameInput.value);
        }
    });

    // Mark slug as manually edited if user changes it
    categorySlugInput.addEventListener('input', () => {
        categorySlugInput.dataset.manuallyEdited = 'true';
    });

    // Close modal when clicking outside
    categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) {
            closeModal();
        }
    });

    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

async function loadCategories() {
    try {
        loadingMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        tableContainer.style.display = 'none';
        emptyState.style.display = 'none';

        allCategories = await api.getCategories();

        loadingMessage.style.display = 'none';

        if (allCategories.length === 0) {
            emptyState.style.display = 'block';
        } else {
            tableContainer.style.display = 'block';
            renderCategories();
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
        loadingMessage.style.display = 'none';
        showError('Failed to load categories. Please try again.');
    }
}

function renderCategories() {
    categoriesTableBody.innerHTML = '';

    allCategories.forEach(category => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>
                <strong>${escapeHtml(category.name)}</strong>
            </td>
            <td>
                <code style="background-color: rgba(76, 175, 80, 0.1); padding: 0.3rem 0.8rem; border-radius: 0.3rem; color: #4CAF50;">${escapeHtml(category.slug)}</code>
            </td>
            <td>${escapeHtml(category.description || '-')}</td>
            <td>${category.article_count || 0}</td>
            <td>
                <div class="article-actions">
                    <button onclick="openEditModal(${category.id})" class="btn btn-secondary btn-small" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="openDeleteModal(${category.id})" class="btn btn-danger btn-small" title="Delete" ${category.article_count > 0 ? 'disabled' : ''}>
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        categoriesTableBody.appendChild(row);
    });
}

function openAddModal() {
    editingCategoryId = null;
    modalTitle.textContent = 'Add New Category';
    submitText.textContent = 'Add Category';
    categoryForm.reset();
    delete categorySlugInput.dataset.manuallyEdited;
    categoryModal.style.display = 'flex';
}

function openEditModal(categoryId) {
    editingCategoryId = categoryId;
    const category = allCategories.find(c => c.id === categoryId);

    if (!category) return;

    modalTitle.textContent = 'Edit Category';
    submitText.textContent = 'Update Category';
    categoryNameInput.value = category.name;
    categorySlugInput.value = category.slug;
    categoryDescInput.value = category.description || '';
    categorySlugInput.dataset.manuallyEdited = 'true';

    categoryModal.style.display = 'flex';
}

function closeModal() {
    categoryModal.style.display = 'none';
    categoryForm.reset();
    editingCategoryId = null;
}

async function handleSubmit(event) {
    event.preventDefault();

    const categoryData = {
        name: categoryNameInput.value.trim(),
        slug: categorySlugInput.value.trim(),
        description: categoryDescInput.value.trim() || null
    };

    // Validate
    if (!categoryData.name || !categoryData.slug) {
        showError('Name and slug are required');
        return;
    }

    // Disable submit button
    const submitBtn = categoryForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitText.textContent = editingCategoryId ? 'Updating...' : 'Adding...';

    try {
        if (editingCategoryId) {
            // Update existing category
            await api.updateCategory(editingCategoryId, categoryData);
            showSuccess('Category updated successfully!');
        } else {
            // Create new category
            await api.createCategory(categoryData);
            showSuccess('Category created successfully!');
        }

        closeModal();
        await loadCategories();
    } catch (error) {
        console.error('Failed to save category:', error);
        showError(error.message || 'Failed to save category. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitText.textContent = editingCategoryId ? 'Update Category' : 'Add Category';
    }
}

function openDeleteModal(categoryId) {
    const category = allCategories.find(c => c.id === categoryId);

    if (!category) return;

    if (category.article_count > 0) {
        showError(`Cannot delete "${category.name}" because it has ${category.article_count} article(s). Please reassign or delete those articles first.`);
        return;
    }

    categoryToDelete = categoryId;
    deleteMessage.textContent = `Are you sure you want to delete "${category.name}"? This action cannot be undone.`;
    deleteModal.style.display = 'flex';
}

function closeDeleteModal() {
    categoryToDelete = null;
    deleteModal.style.display = 'none';
}

async function deleteCategory() {
    if (!categoryToDelete) return;

    try {
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = 'Deleting...';

        await api.deleteCategory(categoryToDelete);

        closeDeleteModal();
        showSuccess('Category deleted successfully!');
        await loadCategories();
    } catch (error) {
        console.error('Failed to delete category:', error);
        showError(error.message || 'Failed to delete category. Please try again.');
    } finally {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Delete';
    }
}

function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions available globally for onclick
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
