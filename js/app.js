/**
 * SkyDash-Manager - Controlador Principal (App Orchestrator)
 * Inicializa y coordina los módulos de la aplicación.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('SkyDash-Manager: Inicializando módulos...');

    // 1. Inicializar el Módulo del Mapa (Leaflet)
    if (typeof MapModule !== 'undefined') {
        MapModule.init();
    }

    // Escuchar el evento de cambio de ubicación (Lo usaremos en el Sprint 4 para el clima)
    window.addEventListener('skydash:locationChanged', (e) => {
        const { lat, lng, name } = e.detail;
        console.log(`📍 Ubicación seleccionada: ${name} (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
        // Aquí llamaremos al clima en el siguiente sprint
    });
});