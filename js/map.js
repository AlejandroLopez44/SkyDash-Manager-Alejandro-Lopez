/**
 * SkyDash-Manager - Módulo de Mapa Interactivo y Georreferenciación
 * Configura Leaflet, gestiona marcadores dinámicos y transiciones animadas.
 */

const MapModule = {
    map: null,
    currentMarker: null,
    currentLat: 10.4806,  // Coordenadas por defecto (Caracas, Venezuela - UCAB)
    currentLng: -66.9036,
    currentLocationName: 'Caracas, Venezuela',

    /**
     * Inicializa el mapa dentro del contenedor #map
     */
    init() {
        if (this.map) return; // Evitar doble inicialización

        // Crear mapa centrado por defecto con nivel de zoom 11
        this.map = L.map('map', {
            zoomControl: true,
            attributionControl: false
        }).setView([this.currentLat, this.currentLng], 11);

        // Añadir capa de mosaicos de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(this.map);

        // Colocar el marcador inicial
        this.updateMarker(this.currentLat, this.currentLng, '🌤️', 'Caracas (Por Defecto)');

        // Configurar evento de clic sobre el mapa para georreferenciación directa
        this.map.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            await this.handleMapClick(lat, lng);
        });

        // Escuchar cuando el usuario hace login para que Leaflet ajuste su tamaño
        window.addEventListener('skydash:loginSuccess', () => {
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                }
            }, 300);
        });

        // Configurar evento del formulario de búsqueda manual
        this.setupSearchForm();
    },

    /**
     * Actualiza o crea el marcador principal usando DivIcon para inyectar emojis
     * @param {number} lat 
     * @param {number} lng 
     * @param {string} emoji - Icono climático (ej. 🌤️, 🌧️)
     * @param {string} title - Texto para el popup
     */
    updateMarker(lat, lng, emoji = '📍', title = '') {
        this.currentLat = lat;
        this.currentLng = lng;

        // Crear un DivIcon personalizado con CSS puro
        const customIcon = L.divIcon({
            className: 'custom-weather-marker',
            html: `<div style="font-size: 28px; filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.5)); transform: translate(-50%, -50%); cursor: pointer;">${emoji}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        if (this.currentMarker) {
            this.currentMarker.setLatLng([lat, lng]);
            this.currentMarker.setIcon(customIcon);
        } else {
            this.currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
        }

        if (title) {
            this.currentMarker.bindPopup(`<b>${title}</b><br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`).openPopup();
        }

        // Actualizar la interfaz de usuario de la barra del mapa
        this.updateUIHeader(lat, lng, title || this.currentLocationName);
    },

    /**
     * Realiza un vuelo animado hacia nuevas coordenadas
     */
    flyTo(lat, lng, zoom = 12) {
        if (this.map) {
            this.map.flyTo([lat, lng], zoom, {
                animate: true,
                duration: 1.5 // Duración de la animación en segundos
            });
        }
    },

    /**
     * Maneja el clic sobre el mapa: traduce coordenadas y mueve el marcador
     */
    async handleMapClick(lat, lng) {
        // Mover marcador temporalmente con un emoji de carga/puntero
        this.updateMarker(lat, lng, '⏳', 'Buscando localidad...');
        
        // Llamada a la API de geocodificación inversa
        const locationName = await WeatherAPI.getReverseGeocoding(lat, lng);
        this.currentLocationName = locationName;
        
        // Actualizar el marcador con el nombre descriptivo real
        this.updateMarker(lat, lng, '📍', locationName);
        this.flyTo(lat, lng, this.map.getZoom());

        // Disparar evento para que el módulo meteorológico cargue el clima de estas coordenadas
        window.dispatchEvent(new CustomEvent('skydash:locationChanged', {
            detail: { lat, lng, name: locationName }
        }));
    },

    /**
     * Configura el buscador manual de texto
     */
    setupSearchForm() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');

        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (!query) return;

                try {
                    searchInput.disabled = true;
                    const result = await WeatherAPI.searchLocation(query);
                    
                    if (result) {
                        this.currentLocationName = result.name;
                        this.flyTo(result.lat, result.lng, 12);
                        this.updateMarker(result.lat, result.lng, '📍', result.name);
                        
                        // Notificar al sistema del cambio de ubicación
                        window.dispatchEvent(new CustomEvent('skydash:locationChanged', {
                            detail: { lat: result.lat, lng: result.lng, name: result.name }
                        }));
                        
                        searchInput.value = '';
                    } else {
                        alert('No se encontró ninguna ubicación con ese nombre.');
                    }
                } catch (error) {
                    alert('Error al buscar la localidad. Verifique su conexión.');
                } finally {
                    searchInput.disabled = false;
                }
            });
        }
    },

    /**
     * Actualiza el encabezado del mapa (Nombre de ciudad y badge de coordenadas)
     */
    updateUIHeader(lat, lng, name) {
        const nameEl = document.getElementById('current-location-name');
        const coordsEl = document.getElementById('current-coords');
        
        if (nameEl) nameEl.textContent = name;
        if (coordsEl) coordsEl.textContent = `Lat: ${lat.toFixed(4)} | Lng: ${lng.toFixed(4)}`;
    }
};