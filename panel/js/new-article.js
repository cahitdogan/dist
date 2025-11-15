// DOM Elements
const articleForm = document.getElementById('article-form');
const titleInput = document.getElementById('title');
const slugInput = document.getElementById('slug');
const excerptInput = document.getElementById('excerpt');
const contentInput = document.getElementById('content');
const categorySelect = document.getElementById('category_id');
const featuredImageFile = document.getElementById('featured_image');
const featuredImageInput = document.getElementById('featured_image_url');
const readTimeInput = document.getElementById('read_time');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageBtn = document.getElementById('remove-image');

// Track unsaved changes
let hasUnsavedChanges = false;
let isSubmitting = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    setupEventListeners();
    setupUnsavedChangesWarning();

    // Initialize text editor toolbar
    if (window.TextEditor) {
        new TextEditor('content');
    }

    // Initialize auto-save (saves every 30 seconds)
    if (window.AutoSave) {
        new AutoSave('article-form', 'new-article-autosave', 30000);
    }
});

function setupEventListeners() {
    // Auto-generate slug from title
    titleInput.addEventListener('input', () => {
        if (!slugInput.dataset.manuallyEdited) {
            slugInput.value = generateSlug(titleInput.value);
        }
    });

    // Mark slug as manually edited if user changes it
    slugInput.addEventListener('input', () => {
        slugInput.dataset.manuallyEdited = 'true';
    });

    // Auto-calculate reading time when content changes
    contentInput.addEventListener('input', () => {
        const wordCount = updateWordCount(contentInput.value);

        if (!readTimeInput.dataset.manuallyEdited) {
            const readTime = calculateReadingTime(contentInput.value);
            readTimeInput.value = readTime;
        }
    });

    // Mark read time as manually edited if user changes it
    readTimeInput.addEventListener('input', () => {
        readTimeInput.dataset.manuallyEdited = 'true';
    });

    // Handle image file selection
    featuredImageFile.addEventListener('change', handleImageSelect);

    // Handle remove image button
    removeImageBtn.addEventListener('click', removeImage);

    // Handle form submission
    articleForm.addEventListener('submit', handleSubmit);
}

function handleImageSelect(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        featuredImageFile.value = '';
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        featuredImageFile.value = '';
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    featuredImageFile.value = '';
    featuredImageInput.value = '';
    previewImg.src = '';
    imagePreview.style.display = 'none';
}

async function loadCategories() {
    try {
        const categories = await api.getCategories();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
        showError('Failed to load categories');
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const submitButton = event.submitter;
    const status = submitButton.value;

    // Validate form
    if (!titleInput.value.trim()) {
        showError('Title is required');
        return;
    }

    if (!slugInput.value.trim()) {
        showError('Slug is required');
        return;
    }

    if (!contentInput.value.trim()) {
        showError('Content is required');
        return;
    }

    // Disable submit buttons
    const submitButtons = articleForm.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(btn => {
        btn.disabled = true;
        btn.textContent = 'Saving...';
    });

    try {
        let imageUrl = featuredImageInput.value.trim() || null;

        // Upload image if a file is selected
        if (featuredImageFile.files.length > 0) {
            try {
                submitButtons.forEach(btn => {
                    btn.textContent = 'Uploading image...';
                });

                const uploadResult = await api.uploadImage(featuredImageFile.files[0]);
                imageUrl = uploadResult.filePath;
            } catch (uploadError) {
                console.error('Image upload failed:', uploadError);
                showError('Failed to upload image: ' + uploadError.message);

                // Re-enable submit buttons
                submitButtons.forEach(btn => {
                    btn.disabled = false;
                });

                // Restore button text
                const draftBtn = articleForm.querySelector('button[value="draft"]');
                const publishBtn = articleForm.querySelector('button[value="published"]');
                if (draftBtn) draftBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save as Draft';
                if (publishBtn) publishBtn.innerHTML = '<i class="fa-solid fa-check"></i> Publish';
                return;
            }
        }

        submitButtons.forEach(btn => {
            btn.textContent = 'Saving article...';
        });

        // Prepare article data
        const articleData = {
            title: titleInput.value.trim(),
            slug: slugInput.value.trim(),
            excerpt: excerptInput.value.trim() || null,
            content: contentInput.value.trim(),
            category_id: categorySelect.value ? parseInt(categorySelect.value) : null,
            featured_image_url: imageUrl,
            read_time: parseInt(readTimeInput.value) || 5,
            status: status
        };

        const result = await api.createArticle(articleData);

        showSuccess(`Article ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);

        // Redirect to articles list after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'articles.html';
        }, 1500);
    } catch (error) {
        console.error('Failed to create article:', error);
        showError(error.message || 'Failed to create article. Please try again.');

        // Re-enable submit buttons
        submitButtons.forEach(btn => {
            btn.disabled = false;
        });

        // Restore button text
        const draftBtn = articleForm.querySelector('button[value="draft"]');
        const publishBtn = articleForm.querySelector('button[value="published"]');
        if (draftBtn) draftBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save as Draft';
        if (publishBtn) publishBtn.innerHTML = '<i class="fa-solid fa-check"></i> Publish';
    }
}

function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function calculateReadingTime(content) {
    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, ' ');

    // Count words (split by whitespace and filter empty strings)
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // Average reading speed: 238 words per minute
    const wordsPerMinute = 238;

    // Calculate reading time in minutes (round up to nearest minute)
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    // Minimum 1 minute
    return readingTime > 0 ? readingTime : 1;
}

function updateWordCount(content) {
    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, ' ');

    // Count words (split by whitespace and filter empty strings)
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    // Update word count display
    const wordCountElement = document.getElementById('word-count');
    if (wordCountElement) {
        wordCountElement.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
    }

    return wordCount;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hide after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    successMessage.style.cssText = `
        display: block;
        padding: 1.5rem;
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        border-radius: 0.4rem;
        margin-bottom: 2rem;
        font-size: 1.4rem;
    `;
    errorMessage.style.display = 'none';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupUnsavedChangesWarning() {
    // Track changes on all form inputs
    const formInputs = articleForm.querySelectorAll('input, textarea, select');

    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (!isSubmitting) {
                hasUnsavedChanges = true;
            }
        });
    });

    // Warn before leaving page if there are unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges && !isSubmitting) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });

    // Mark as submitting when form is submitted
    articleForm.addEventListener('submit', () => {
        isSubmitting = true;
        hasUnsavedChanges = false;
    });
}
