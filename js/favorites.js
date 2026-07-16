/**
 * SkyDash-Manager - Módulo de Gestión Personalizada (Mis Ubicaciones)
 * Administra la colección privada de ubicaciones favoritas y su persistencia en localStorage.
 */

const FavoritesModule = {
    favorites: [],
    storageKey: 'skydash_favorites',

    /**
     * Inicializa el módulo, carga los favoritos guardados y configura los eventos
     */
    init() {
        this.loadFavorites();
        this.renderList();
        this.setupEventListeners();
    },

    /**
     * Carga las ubicaciones guardadas desde localStorage
     */
    loadFavorites() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                this.favorites = JSON.parse(saved);
            } catch (e) {
                console.error('Error al parsear favoritos:', e);
                this.favorites = [];
            }
        }
    },

    /**
     * Guarda el array actual de favoritos en localStorage
     */
    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
    },

    /**
     * Agrega una nueva ubicación a la colección privada
     * @param {Object} location - { name, lat, lng }
     */
    addFavorite(location) {
        // Evitar duplicados revisando si las coordenadas o el nombre son muy parecidos
        const exists = this.favorites.some(fav => 
            fav.name.toLowerCase() === location.name.toLowerCase() ||
            (Math.abs(fav.lat - location.lat) < 0.01 && Math.abs(fav.lng - location.lng) < 0.01)
        );

        if (exists) {
            alert('Esta ubicación ya se encuentra en tus favoritos.');
            return;
        }

        // Agregar al inicio del array
        this.favorites.unshift({
            id: Date.now(), // Identificador único basado en timestamp
            name: location.name,
            lat: location.lat,
            lng: location.lng
        });

        this.saveToStorage();
        this.renderList();
        alert(`¡"${location.name}" se guardó en tu colección!`);
    },

    /**
     * Elimina una ubicación de la lista según su id
     * @param {number} id 
     * @param {Event} e - Evento del clic para evitar que se active la navegación al mapa
     */
    removeFavorite(id, e) {
        if (e) e.stopPropagation(); // Evitar que el clic en "borrar" dispare la carga de la ciudad

        this.favorites = this.favorites.filter(fav => fav.id !== id);
        this.saveToStorage();
        this.renderList();
    },

    /**
     * Dibuja la lista de ubicaciones en la barra lateral del HTML
     */
    renderList() {
        const listContainer = document.getElementById('favorites-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        if (this.favorites.length === 0) {
            listContainer.innerHTML = '<li class="empty-msg">No tienes ubicaciones guardadas aún.</li>';
            return;
        }

        this.favorites.forEach(fav => {
            const li = document.createElement('li');
            li.title = `Haga clic para ver el clima en ${fav.name}`;
            
            li.innerHTML = `
                <div style="display:flex; align-items:center; gap:0.5rem; overflow:hidden;">
                    <span>📍</span>
                    <strong style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${fav.name}</strong>
                </div>
                <button class="btn-icon delete-btn" title="Eliminar de favoritos" style="font-size:1rem; color:#ef4444;">🗑️</button>
            `;

            // Carga rápida: Al hacer clic en el elemento, dispara la reubicación del mapa y clima
            li.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('skydash:locationChanged', {
                    detail: { lat: fav.lat, lng: fav.lng, name: fav.name }
                }));
            });

            // Configurar el botón de borrar
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => this.removeFavorite(fav.id, e));

            listContainer.appendChild(li);
        });
    },

    /**
     * Configura el botón "+ Guardar" del HTML para capturar el punto actual
     */
    setupEventListeners() {
        const saveBtn = document.getElementById('save-location-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                // Tomamos la ubicación actual del módulo del mapa
                if (typeof MapModule !== 'undefined' && MapModule.currentLat) {
                    // Limpiamos el nombre en caso de que tenga el formato "Ciudad — ☀️ Despejado (20°C)"
                    const cleanName = MapModule.currentLocationName.split(' — ')[0];
                    
                    this.addFavorite({
                        name: cleanName,
                        lat: MapModule.currentLat,
                        lng: MapModule.currentLng
                    });
                } else {
                    alert('No hay ninguna ubicación activa en el mapa para guardar.');
                }
            });
        }
    }
};