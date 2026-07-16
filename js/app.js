/**
 * SkyDash-Manager - Controlador Principal (App Orchestrator)
 * Conecta los eventos del mapa con las peticiones meteorológicas de Open-Meteo.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('SkyDash-Manager: Inicializando módulos...');

    // 1. Inicializar el Módulo del Mapa (Leaflet)
    if (typeof MapModule !== 'undefined') {
        MapModule.init();
    }

    // 2. Inicializar el Módulo de Favoritos
    if (typeof FavoritesModule !== 'undefined') {
        FavoritesModule.init();
    }

    // 3. Cargar clima por defecto al iniciar sesión exitosamente
    window.addEventListener('skydash:loginSuccess', () => {
        // Disparar carga de clima para la ubicación inicial del mapa (Caracas)
        fetchAndRenderWeather(MapModule.currentLat, MapModule.currentLng, MapModule.currentLocationName);
    });

    // 4. Escuchar el evento cuando el usuario hace clic en el mapa o busca una localidad
    window.addEventListener('skydash:locationChanged', (e) => {
        const { lat, lng, name } = e.detail;
        console.log(`Actualizando clima para: ${name} (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
        fetchAndRenderWeather(lat, lng, name);
    });

    /**
     * Pide el clima a Open-Meteo, renderiza las tarjetas y actualiza el marcador dinámico
     * @param {number} lat 
     * @param {number} lng 
     * @param {string} locationName 
     */
    async function fetchAndRenderWeather(lat, lng, locationName) {
        try {
            // Indicar visualmente en el mapa que estamos calculando el clima
            MapModule.updateMarker(lat, lng, '⏳', `Consultando clima en ${locationName}...`);

            // Obtener datos de Open-Meteo
            const weatherData = await WeatherAPI.getWeather(lat, lng);
            
            // Renderizar la interfaz del clima actual y pronóstico 7 días
            WeatherUI.render(weatherData);

            // ¡MAGIA! Inyectar programáticamente el emoji del clima actual al marcador de Leaflet
            const currentEmoji = weatherData.current.emoji;
            const currentDesc = weatherData.current.description;
            
            // CORRECCIÓN VISUAL: Usamos un separador limpio (—) sin etiquetas HTML para evitar texto roto en el encabezado
            const cleanTitle = `${locationName} — ${currentEmoji} ${currentDesc} (${weatherData.current.temp}°C)`;
            
            MapModule.updateMarker(lat, lng, currentEmoji, cleanTitle);
            
        } catch (error) {
            console.error('Error al actualizar el clima:', error);
            // Restaurar un marcador de advertencia si falló la red
            MapModule.updateMarker(lat, lng, '⚠️', `${locationName} (Sin datos meteorológicos)`);
        }
    }

    // NUEVO: Registrar el Service Worker para habilitar el Modo Offline
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service_worker.js')
                .then((registration) => {
                    console.log('Service Worker registrado exitosamente en el alcance:', registration.scope);
                })
                .catch((error) => {
                    console.error('Falla en el registro del Service Worker:', error);
                });
        });
    }
});