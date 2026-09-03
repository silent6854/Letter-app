// themes.js - Theme definitions and switching
const themes = {
    light: 'light',
    dark: 'dark'
};

let currentTheme = localStorage.getItem('letter-theme') || 'light';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('letter-theme', theme);
    // Update theme button icon
    const themeBtn = document.getElementById('btn-theme');
    if (themeBtn) {
        themeBtn.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
}

function toggleTheme() {
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
}

// Initialize theme on load
applyTheme(currentTheme);

export { applyTheme, toggleTheme, currentTheme };
