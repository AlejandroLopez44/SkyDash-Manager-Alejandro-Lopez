/**
 * SkyDash-Manager - Módulo de Peticiones HTTP y APIs
 * Gestiona la comunicación asíncrona para Geocodificación (Nominatim) y Clima (Open-Meteo).
 */

const WeatherAPI = {
    /**
     * Geocodificación Directa: Busca una ubicación por texto y retorna sus coordenadas
     * @param {string} query - Nombre de la ciudad o lugar
     * @returns {Promise<Object|null>} - Objeto con lat, lng, y nombre formateado
     */
    async searchLocation(query) {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'SkyDash-Manager-UCAB-App' }
            });
            
            if (!response.ok) throw new Error('Error en la respuesta de la red');
            
            const data = await response.json();
            if (data && data.length > 0) {
                const item = data[0];
                return {
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                    name: item.display_name.split(',')[0], // Tomar el nombre principal
                    fullName: item.display_name
                };
            }
            return null;
        } catch (error) {
            console.error('Error en geocodificación directa:', error);
            throw error;
        }
    },

    /**
     * Geocodificación Inversa: Traduce coordenadas (lat, lng) en un nombre legible
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     * @returns {Promise<string>} - Nombre de la localidad descriptiva
     */
    async getReverseGeocoding(lat, lng) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'SkyDash-Manager-UCAB-App' }
            });
            
            if (!response.ok) throw new Error('Error al traducir coordenadas');
            
            const data = await response.json();
            if (data && data.address) {
                const addr = data.address;
                // Intentar extraer la ciudad, pueblo, municipio o estado
                return addr.city || addr.town || addr.village || addr.municipality || addr.state || 'Ubicación Georreferenciada';
            }
            return 'Punto en el mapa';
        } catch (error) {
            console.error('Error en geocodificación inversa:', error);
            return 'Ubicación Desconocida';
        }
    }
};