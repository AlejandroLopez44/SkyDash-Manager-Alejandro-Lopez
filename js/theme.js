/**
 * SkyDash-Manager - Módulo de Tematización Dual
 * Gestiona el cambio entre Modo Oscuro y Modo Claro con persistencia en localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // 1. Verificar preferencia guardada en localStorage o usar 'light' por defecto
    const savedTheme = localStorage.getItem('skydash_theme') || 'light';
    setTheme(savedTheme);

    // 2. Event Listener para el botón de cambio de tema
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    /**
     * Aplica el tema seleccionado al documento y actualiza el ícono del botón
     * @param {string} theme - 'light' o 'dark'
     */
    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('skydash_theme', theme);
        
        if (themeToggleBtn) {
            themeToggleBtn.textContent = theme === 'light' ? '🌙' : '☀️';
            themeToggleBtn.setAttribute('title', theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro');
        }
    }
});