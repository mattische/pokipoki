// Theme management utility
const ThemeManager = {
    currentTheme: 'modern',

    /**
     * Initialize theme manager
     */
    init() {
        // Default theme is already set in HTML
        console.log('ThemeManager initialized');
    },

    /**
     * Apply a theme by changing the stylesheet
     */
    applyTheme(themeName) {
        const themeStylesheet = document.getElementById('theme-stylesheet');
        const themeFiles = {
            'modern': 'styles.css',
            'flat': 'styles-flat.css',
            'retro': 'styles-retro.css'
        };

        if (themeFiles[themeName]) {
            themeStylesheet.href = themeFiles[themeName];
            this.currentTheme = themeName;
            console.log(`Theme changed to: ${themeName}`);
        }
    },

    /**
     * Get current theme
     */
    getTheme() {
        return this.currentTheme;
    }
};

export default ThemeManager;
