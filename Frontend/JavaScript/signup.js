// Wait for DOM content to finish loading
document.addEventListener("DOMContentLoaded", () => {
    const tabLogin = document.getElementById('tab-login');

    if (tabLogin) {
        // Clear routing behavior when navigating back to login page
        tabLogin.addEventListener('click', () => {
            window.location.href = "login.html"; 
        });
    }
});