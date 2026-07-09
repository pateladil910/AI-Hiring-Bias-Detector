// Document ready safety wrappers and interactive state modifiers
document.addEventListener("DOMContentLoaded", () => {
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');

    if (tabLogin && tabSignup) {
        // Active display classes assignment for Login view state
        tabLogin.addEventListener('click', () => {
            tabLogin.className = "pb-2 pr-4 font-display font-semibold text-xs text-blue-600 border-b-2 border-blue-600 transition-all focus:outline-none";
            tabSignup.className = "pb-2 px-4 font-display font-medium text-xs text-slate-400 hover:text-slate-700 transition-all focus:outline-none";
        });

        // Toggle configuration adjustments when clicking Sign Up
        tabSignup.addEventListener('click', () => {
            tabSignup.className = "pb-2 pr-4 font-display font-semibold text-xs text-blue-600 border-b-2 border-blue-600 transition-all focus:outline-none";
            tabLogin.className = "pb-2 px-4 font-display font-medium text-xs text-slate-400 hover:text-slate-700 transition-all focus:outline-none";
        });
    }
});