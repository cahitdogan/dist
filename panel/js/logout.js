const logoutButton = document.querySelector("header > div > button");

logoutButton.addEventListener("click", async function() {
    try {
        await api.logout();
        window.location.href = "login.html";
    } catch (error) {
        console.error('Logout error:', error);
        // Redirect anyway to ensure user is logged out
        window.location.href = "login.html";
    }
});
