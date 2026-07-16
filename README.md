# 🌤️ SkyDash-Manager | Plataforma Avanzada de Analítica Meteorológica

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet_JS-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![PWA Offline](https://img.shields.io/badge/PWA-Resiliencia_Offline-4A90E2?style=for-the-badge)

**SkyDash-Manager** es una aplicación web SPA (*Single Page Application*) de visualización y analítica meteorológica georreferenciada, desarrollada bajo estrictos estándares de modularidad, resiliencia de red y diseño responsivo sin frameworks comerciales.

---

## Características Principales

*   **Módulo de Autenticación y Seguridad:** Flujo de inicio de sesión con validación de credenciales, feedback visual obligatorio mediante indicadores de carga (*spinners*) y cierre de sesión seguro con limpieza de tokens y almacenamiento local.
*   **Arquitectura Georreferenciada Interactiva:** Integración con mapas de **Leaflet JS**. Permite la selección de coordenadas mediante eventos de clic y manipulación programática de marcadores (`DivIcon`) para reflejar visualmente el estado climático con iconos en tiempo real.
*   **Geocodificación Directa e Inversa:** Búsqueda por texto con animaciones de vuelo (*flyTo*) hacia el objetivo y traducción automática de coordenadas geográficas en nombres legibles de localidades a través de la API externa de **Nominatim (OpenStreetMap)**.
*   **Panel Meteorológico y Pronóstico Extendido:** Consulta asíncrona a la API de **Open-Meteo**. Renderización semántica de condiciones climáticas actuales (temperatura, humedad, viento) y visualización en cuadrícula del pronóstico extendido a 7 días.
*   **Colección Privada y Persistencia Local:** Sección de "Mis Ubicaciones" con almacenamiento persistente en el cliente (`localStorage`), garantizando que los lugares guardados permanezcan tras recargar el navegador o cerrar la sesión. Carga ultra-rápida y reubicación inmediata al seleccionar un favorito.
*   **Tematización Dual (Modo Oscuro / Claro):** Sistema de diseño con variables CSS nativas (`:root` / `data-theme`) que asegura el confort visual adaptándose a la preferencia del usuario con transiciones suaves.
*   **Resiliencia y Modo Offline (PWA):** Implementación de un **Service Worker (`service_worker.js`)** y manifiesto web (`manifest.json`) con estrategia *Cache-First* para activos estáticos. Permite que la interfaz cargue sin errores y la colección de favoritos sea accesible en completa ausencia de conexión a internet.

---

## Tecnologías y Cumplimiento Técnico

Este sistema fue desarrollado cumpliendo al 100% con las restricciones de la arquitectura requerida:
*   **Tecnologías Frontend Puras:** Programado exclusivamente con HTML5 semántico, CSS3 puro y **JavaScript Vanilla (ES6+)**.
*   **Cero Frameworks:** No se utilizan marcos de trabajo como React, Angular, Vue, Svelte, ni librerías combinadas de estilos como Tailwind o Bootstrap. Todo el sistema responsive y maquetado es propio.
*   **Consumo de APIs HTTP:** Comunicación completamente asíncrona usando la API nativa `fetch` hacia **Open-Meteo** (clima) y **OpenStreetMap** (geocodificación).

---

## Arquitectura del Directorio

```text
skydash-manager/
│
├── index.html              # Estructura principal SPA (Vistas de Login y Dashboard)
├── service_worker.js       # Proxy offline y caché de recursos del cliente
├── manifest.json           # Manifiesto para instalación PWA y metadatos
├── README.md               # Documentación general del proyecto
│
├── css/
│   └── styles.css          # Sistema de diseño nativo, responsive y variables de tema
│
├── js/
│   ├── app.js              # Controlador principal (Orquestador y puente de eventos)
│   ├── auth.js             # Gestión de sesión, spinner asíncrono y logout
│   ├── map.js              # Configuración de Leaflet, DivIcon y transiciones flyTo
│   ├── api.js              # Peticiones HTTP para Open-Meteo y Nominatim
│   ├── favorites.js        # CRUD y persistencia en localStorage para Mis Ubicaciones
│   └── theme.js            # Módulo de conmutación y persistencia de Modo Oscuro/Claro
│
└── assets/
    └── icons/
        └── icon.svg        # Ícono vectorial nativo de la aplicación