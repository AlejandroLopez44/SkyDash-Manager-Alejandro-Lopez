/**
 * SkyDash-Manager - Módulo de Autenticación y Seguridad
 * Gestiona el inicio de sesión simulado, indicadores de carga (spinners) y cierre de sesión.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Credenciales estáticas permitidas por el enunciado
    const MOCK_USER = 'admin';
    const MOCK_PASS = '1234';

    // Referencias a elementos del DOM
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginSpinner = document.getElementById('login-spinner');
    const loginSubmitBtn = document.getElementById('login-submit');
    const logoutBtn = document.getElementById('logout-btn');
    
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');

    // 1. Verificar si ya existe una sesión activa al cargar la página
    checkSession();

    // 2. Event Listener para el formulario de Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const user = usernameInput.value.trim();
            const pass = passwordInput.value;

            // Iniciar feedback visual (Mostrar spinner y deshabilitar botón)
            toggleLoading(true);

            // Simular retardo de petición asíncrona a un servidor (1.5 segundos)
            setTimeout(() => {
                if (user === MOCK_USER && pass === MOCK_PASS) {
                    // Autenticación exitosa: Guardar token simulado y mostrar Dashboard
                    localStorage.setItem('skydash_token', 'token_auth_valid_ucab_2026');
                    localStorage.setItem('skydash_user', user);
                    
                    loginForm.reset();
                    showDashboard();
                } else {
                    // Error de credenciales
                    alert('Credenciales incorrectas. Utiliza: admin / 1234');
                }
                
                // Finalizar feedback visual
                toggleLoading(false);
            }, 1500);
        });
    }

    // 3. Event Listener para el botón de Cerrar Sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Limpieza de tokens y datos temporales de sesión
            localStorage.removeItem('skydash_token');
            localStorage.removeItem('skydash_user');
            
            // Redirección a la pantalla de bienvenida
            showLogin();
        });
    }

    /**
     * Alterna el estado visual de carga en el botón de login
     * @param {boolean} isLoading 
     */
    function toggleLoading(isLoading) {
        const btnText = loginSubmitBtn.querySelector('.btn-text');
        
        if (isLoading) {
            btnText.textContent = 'Validando...';
            loginSpinner.classList.remove('hidden');
            loginSubmitBtn.disabled = true;
            loginSubmitBtn.style.opacity = '0.8';
        } else {
            btnText.textContent = 'Iniciar Sesión';
            loginSpinner.classList.add('hidden');
            loginSubmitBtn.disabled = false;
            loginSubmitBtn.style.opacity = '1';
        }
    }

    /**
     * Verifica si hay un token guardado para mostrar el dashboard directamente
     */
    function checkSession() {
        const token = localStorage.getItem('skydash_token');
        if (token) {
            showDashboard();
        } else {
            showLogin();
        }
    }

    /**
     * Muestra la vista del Dashboard y el botón de logout
     */
    function showDashboard() {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        
        // Disparar evento personalizado para que el mapa sepa que se mostró el dashboard
        // (Leaflet necesita recalcular su tamaño al cambiar de display: none a display: block)
        window.dispatchEvent(new Event('skydash:loginSuccess'));
    }

    /**
     * Muestra la vista de Login y oculta el Dashboard
     */
    function showLogin() {
        dashboardView.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        loginView.classList.remove('hidden');
    }
});