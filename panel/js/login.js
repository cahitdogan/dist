isLoggedIn();

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const errorMessage = document.querySelector("form p");

loginButton.addEventListener("click", () => {
    signIn();
});

async function signIn() {
    try {
        const data = await api.login(email.value, password.value);

        errorMessage.style.color = "green";
        errorMessage.textContent = "Login successful";

        // Store session ID if provided
        if (data.sessionId) {
            localStorage.setItem('session_id', data.sessionId);
        }

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 500);
    } catch (error) {
        errorMessage.style.color = "red";
        errorMessage.textContent = error.message || "Login failed. Please check your credentials.";
    }
}

async function isLoggedIn() {
    const token = localStorage.getItem('auth_token');

    if (token) {
        try {
            await api.verifyToken();
            window.location.href = "dashboard.html";
        } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    }
}
