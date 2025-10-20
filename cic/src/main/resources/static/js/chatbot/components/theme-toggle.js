document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        themeToggle: document.getElementById('themeToggle'),
        themeImage: document.getElementById('themeImage'),
    }

    const state = {
        isDarkMode: localStorage.getItem('theme') === 'dark'
    };

    const themeManager = {
        init: () => {
            if (state.isDarkMode) {
                themeManager.applyDarkMode();
            }
        },

        toggle: () => {
            state.isDarkMode = !state.isDarkMode;

            if (state.isDarkMode) {
                themeManager.applyDarkMode();
                window.MessageBox.setThemeMode('dark');
            } else {
                themeManager.applyLightMode();
                window.MessageBox.setThemeMode('light');
            }

            localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
        },

        applyDarkMode: () => {
            document.body.setAttribute('data-theme', 'dark');
            elements.themeImage.src = '/images/dark.png';
            elements.themeImage.alt = 'Dark Mode';
        },

        applyLightMode: () => {
            document.body.removeAttribute('data-theme');
            elements.themeImage.src = '/images/light.png';
            elements.themeImage.alt = 'Light Mode';
        }
    };

    const setupEventListeners = () => {
        elements.themeToggle.addEventListener('click', themeManager.toggle);
    };

    // Initialize
    const init = () => {
        themeManager.init();
        setupEventListeners();
    };

    init();
})