// Populate sidebar user information from localStorage
function loadSidebarUserInfo() {
    const userStr = localStorage.getItem('user');

    if (userStr) {
        try {
            const user = JSON.parse(userStr);

            const userNameElement = document.getElementById('user-name');
            const userEmailElement = document.getElementById('user-email');

            if (userNameElement && user.name) {
                userNameElement.textContent = user.name;
            }

            if (userEmailElement && user.email) {
                userEmailElement.textContent = user.email;
            }
        } catch (error) {
            console.error('Failed to parse user data:', error);
        }
    }
}

// Load user info when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSidebarUserInfo);
} else {
    loadSidebarUserInfo();
}
