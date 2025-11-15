async function isLoggedIn() {
    const token = localStorage.getItem('auth_token');

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        await api.verifyToken();
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = "login.html";
    }
}

isLoggedIn();
