// DOM Elements
const aboutForm = document.getElementById('about-form');
const nameInput = document.getElementById('name');
const jobTitleInput = document.getElementById('job_title');
const profileImageFile = document.getElementById('profile_image');
const profileImageInput = document.getElementById('profile_image_url');
const bioInput = document.getElementById('bio');
const instagramInput = document.getElementById('instagram_url');
const twitterInput = document.getElementById('twitter_url');
const linkedinInput = document.getElementById('linkedin_url');
const facebookInput = document.getElementById('facebook_url');
const githubInput = document.getElementById('github_url');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageBtn = document.getElementById('remove-image');

let currentAboutData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAboutPage();
    setupEventListeners();
});

function setupEventListeners() {
    // Handle image file selection
    profileImageFile.addEventListener('change', handleImageSelect);

    // Handle remove image button
    removeImageBtn.addEventListener('click', removeImage);

    // Handle form submission
    aboutForm.addEventListener('submit', handleSubmit);
}

function handleImageSelect(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        profileImageFile.value = '';
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        profileImageFile.value = '';
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
    profileImageFile.value = '';
    profileImageInput.value = '';
    previewImg.src = '';
    imagePreview.style.display = 'none';
}

async function loadAboutPage() {
    try {
        loadingMessage.style.display = 'block';
        aboutForm.style.display = 'none';

        const aboutData = await api.getAboutPage();
        currentAboutData = aboutData;

        // Populate form
        nameInput.value = aboutData.name || '';
        jobTitleInput.value = aboutData.job_title || '';
        profileImageInput.value = aboutData.profile_image_url || '';
        bioInput.value = aboutData.bio || '';
        instagramInput.value = aboutData.instagram_url || '';
        twitterInput.value = aboutData.twitter_url || '';
        linkedinInput.value = aboutData.linkedin_url || '';
        facebookInput.value = aboutData.facebook_url || '';
        githubInput.value = aboutData.github_url || '';

        // Show existing image preview if present
        if (aboutData.profile_image_url) {
            // Check if it's a full URL or relative path
            if (aboutData.profile_image_url.startsWith('http')) {
                previewImg.src = aboutData.profile_image_url;
            } else if (aboutData.profile_image_url.startsWith('/uploads')) {
                previewImg.src = `http://localhost:3000${aboutData.profile_image_url}`;
            } else {
                previewImg.src = `../${aboutData.profile_image_url}`;
            }
            imagePreview.style.display = 'block';
        }

        loadingMessage.style.display = 'none';
        aboutForm.style.display = 'block';
    } catch (error) {
        console.error('Failed to load about page:', error);
        loadingMessage.style.display = 'none';
        showError('Failed to load about page data. ' + error.message);
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    // Validate form
    if (!nameInput.value.trim()) {
        showError('Name is required');
        return;
    }

    if (!jobTitleInput.value.trim()) {
        showError('Job title is required');
        return;
    }

    if (!bioInput.value.trim()) {
        showError('Biography is required');
        return;
    }

    // Disable submit button
    const submitButton = aboutForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    try {
        let imageUrl = profileImageInput.value.trim() || null;

        // Upload new image if a file is selected
        if (profileImageFile.files.length > 0) {
            try {
                submitButton.textContent = 'Uploading image...';

                const uploadResult = await api.uploadImage(profileImageFile.files[0]);
                imageUrl = uploadResult.filePath;
            } catch (uploadError) {
                console.error('Image upload failed:', uploadError);
                showError('Failed to upload image: ' + uploadError.message);

                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fa-solid fa-save"></i> Save Changes';
                return;
            }
        }

        submitButton.textContent = 'Saving changes...';

        // Prepare about page data
        const aboutData = {
            name: nameInput.value.trim(),
            job_title: jobTitleInput.value.trim(),
            profile_image_url: imageUrl,
            bio: bioInput.value.trim(),
            instagram_url: instagramInput.value.trim() || null,
            twitter_url: twitterInput.value.trim() || null,
            linkedin_url: linkedinInput.value.trim() || null,
            facebook_url: facebookInput.value.trim() || null,
            github_url: githubInput.value.trim() || null
        };

        const result = await api.updateAboutPage(aboutData);

        showSuccess('About page updated successfully!');

        // Update current data
        currentAboutData = result;

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fa-solid fa-save"></i> Save Changes';
    } catch (error) {
        console.error('Failed to update about page:', error);
        showError(error.message || 'Failed to update about page. Please try again.');

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fa-solid fa-save"></i> Save Changes';
    }
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

    // Hide after 5 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}
