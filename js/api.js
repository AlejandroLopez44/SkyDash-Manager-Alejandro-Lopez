/**
 * SkyDash-Manager - Módulo de Peticiones HTTP y APIs
 * Gestiona Geocodificación (Nominatim) y Analítica Meteorológica (Open-Meteo).
 */

const WeatherAPI = {
    /**
     * Geocodificación Directa: Busca una ubicación por texto y retorna sus coordenadas
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
                    name: item.display_name.split(',')[0],
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
                return addr.city || addr.town || addr.village || addr.municipality || addr.state || 'Ubicación Georreferenciada';
            }
            return 'Punto en el mapa';
        } catch (error) {
            console.error('Error en geocodificación inversa:', error);
            return 'Ubicación Desconocida';
        }
    },

    /**
     * Analítica Meteorológica: Obtiene condiciones actuales y pronóstico de 7 días
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     */
    async getWeather(lat, lng) {
        try {
            // Parámetros: Temperatura actual, humedad, código de clima, viento, y máximas/mínimas diarias
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al consultar datos de Open-Meteo');
            
            const data = await response.json();
            return this.formatWeatherData(data);
        } catch (error) {
            console.error('Error en consulta meteorológica:', error);
            throw error;
        }
    },

    /**
     * Formatea y empaqueta los datos crudos de la API
     */
    formatWeatherData(data) {
        const current = data.current;
        const daily = data.daily;

        const currentMeta = this.getWeatherDescription(current.weather_code);

        // Formatear pronóstico de 7 días
        const forecast = daily.time.map((dateStr, index) => {
            const meta = this.getWeatherDescription(daily.weather_code[index]);
            return {
                date: dateStr,
                dayName: this.formatDayName(dateStr, index),
                maxTemp: Math.round(daily.temperature_2m_max[index]),
                minTemp: Math.round(daily.temperature_2m_min[index]),
                emoji: meta.emoji,
                description: meta.text
            };
        });

        return {
            current: {
                temp: Math.round(current.temperature_2m),
                humidity: current.relative_humidity_2m,
                wind: Math.round(current.wind_speed_10m),
                emoji: currentMeta.emoji,
                description: currentMeta.text
            },
            forecast: forecast
        };
    },

    /**
     * Traduce los códigos WMO de Open-Meteo a Emojis y texto en español
     */
    getWeatherDescription(code) {
        const mapping = {
            0: { text: 'Cielo Despejado', emoji: '☀️' },
            1: { text: 'Mayormente Despejado', emoji: '🌤️' },
            2: { text: 'Parcialmente Nublado', emoji: '⛅' },
            3: { text: 'Nublado', emoji: '☁️' },
            45: { text: 'Niebla / Neblina', emoji: '🌫️' },
            48: { text: 'Niebla con Escarcha', emoji: '🌫️' },
            51: { text: 'Llovizna Ligera', emoji: '🌦️' },
            53: { text: 'Llovizna Moderada', emoji: '🌦️' },
            55: { text: 'Llovizna Densa', emoji: '🌧️' },
            61: { text: 'Lluvia Ligera', emoji: '🌧️' },
            63: { text: 'Lluvia Moderada', emoji: '🌧️' },
            65: { text: 'Lluvia Fuerte', emoji: '🌧️' },
            71: { text: 'Nieve Ligera', emoji: '❄️' },
            73: { text: 'Nieve Moderada', emoji: '❄️' },
            75: { text: 'Nieve Fuerte', emoji: '❄️' },
            80: { text: 'Chubascos Ligeros', emoji: '🌦️' },
            81: { text: 'Chubascos Moderados', emoji: '🌧️' },
            82: { text: 'Chubascos Violentos', emoji: '⛈️' },
            95: { text: 'Tormenta Eléctrica', emoji: '⛈️' },
            96: { text: 'Tormenta con Granizo Ligero', emoji: '⛈️' },
            99: { text: 'Tormenta con Granizo Fuerte', emoji: '⛈️' }
        };
        return mapping[code] || { text: 'Condición Desconocida', emoji: '🌡️' };
    },

    /**
     * Devuelve el nombre del día de la semana (Ej: "Hoy", "Lun", "Mar")
     */
    formatDayName(dateStr, index) {
        if (index === 0) return 'Hoy';
        // Ajustamos la zona horaria añadiendo 'T00:00:00'
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
    }
};

/**
 * Módulo de Renderizado Visual de Datos Meteorológicos (UI)
 */
const WeatherUI = {
    /**
     * Dibuja los datos en las tarjetas del panel del Dashboard
     */
    render(weatherData) {
        // 1. Mostrar las tarjetas que estaban ocultas (.hidden)
        const weatherDetailsCard = document.getElementById('weather-details');
        const forecastSectionCard = document.getElementById('forecast-section');
        
        weatherDetailsCard.classList.remove('hidden');
        forecastSectionCard.classList.remove('hidden');

        // 2. Renderizar Clima Actual
        const { temp, humidity, wind, description, emoji } = weatherData.current;
        
        document.getElementById('metric-temp').textContent = `${temp} °C`;
        document.getElementById('metric-humidity').textContent = `${humidity} %`;
        document.getElementById('metric-wind').textContent = `${wind} km/h`;

        // Actualizar subtítulo de condiciones si queremos dar más detalle visual
        const weatherTitle = weatherDetailsCard.querySelector('h3');
        weatherTitle.innerHTML = `Condiciones Actuales: <span style="font-weight:normal; color:var(--text-secondary); font-size:0.9rem;">${emoji} ${description}</span>`;

        // 3. Renderizar Pronóstico Extendido de 7 Días en Cuadrícula (Grid)
        const forecastGrid = document.getElementById('forecast-grid');
        forecastGrid.innerHTML = ''; // Limpiar pronósticos anteriores

        weatherData.forecast.forEach(day => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'forecast-item';
            itemDiv.innerHTML = `
                <span class="forecast-day">${day.dayName}</span>
                <span style="font-size:0.75rem; color:var(--text-secondary);">${day.date.slice(5)}</span>
                <span class="forecast-icon" title="${day.description}">${day.emoji}</span>
                <div class="forecast-temps">
                    <strong style="color:var(--text-primary);">${day.maxTemp}°</strong> / <span>${day.minTemp}°</span>
                </div>
            `;
            forecastGrid.appendChild(itemDiv);
        });
    }
};