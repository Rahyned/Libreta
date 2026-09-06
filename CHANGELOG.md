# Changelog

Todas las novedades notables de Libreta de Películas se registran aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

## [1.1.0] - 2026-09-06

### Agregado
- Soporte para series: sección propia "Series" en el sidebar (ruta `/series`), con su propia lista, estadísticas, filtros y búsqueda.
- Modelo de datos unificado: campo `kind` (`movie`/`series`) en la tabla `movies` con migración automática, más campos opcionales de serie (`seasons`, `status`).
- Búsqueda de pósters por tipo en el formulario: TMDB usa `/search/tv` + `/genre/tv/list` para series y Wikipedia con variantes `(TV series)`/`(serie de televisión)`.
- Ítem de menú "Agregar serie" (`Ctrl+Shift+S`).
- Watchlist y Comparación con filtro segmentado Todo/Películas/Series y badge "Serie" por fila.
- Tests E2E de series (`series.spec.ts`) y tests Rust/Vitest para kind, temporadas, estado e importación de respaldos.

### Cambiado
- Subtítulo de la marca a "de pelis y series"; textos dinámicos de encabezados, formularios y estados vacíos adaptados por tipo.
- Importación de respaldos: los respaldos viejos sin `kind` se importan como películas; la fusión por título ahora también compara el tipo.
- Tarjeta de película muestra temporadas/estado para series.
- Contraste de texto en ambos temas: el texto sobre botones de acento (pink/blue) usa un espresso más oscuro, el rojo de error se ajustó para cumplir AA en texto/banners con un `error-deep` para los botones de eliminar, y en tema claro las superficies blancas ahora son crema (`surface`).

## [1.0.0] - 2026-09-06

### Agregado
- Fuentes autohospedadas (Inter, Poppins, Caveat) — la app ya no depende de Google Fonts en runtime.
- Content Security Policy estricta en `tauri.conf.json`.
- Set completo de íconos (`.icns`, `.ico`, PNG multi-resolución).
- Índices en `ratings(movie_id)` y `ratings(user_id)` para consultas más rápidas.
- Validación de `year` en el backend (1888–3000) al agregar/editar películas.
- `LICENSE` (MIT) y este `CHANGELOG.md`.
- Respaldo y restauración de datos (JSON) con selector nativo de archivos.
- Logging con `fern` (consola + archivo `app.log` en el directorio de logs).
- Modo oscuro (tokens en CSS variables, toggle en Ajustes, persiste la elección).
- Menú nativo con atajos: `Ctrl+N` para agregar película y `Ctrl+Shift+D` para alternar el tema.
- Suite de tests: Vitest (mock de la API y store) y tests Rust (db, validación de año, backup).
- Tests E2E con Playwright sobre el frontend (flujo de agregar/calificar, watchlist, navegación y tema oscuro) con `npm run test:e2e`.

### Cambiado
- Versión de la app a `1.0.0`.
- Contraste del color secundario `ink-soft` para cumplir WCAG AA.
- Paleta de Tailwind migrada a variables CSS para soportar el tema oscuro.
- Rediseño del modo oscuro: paleta "libreta nocturna" con tokens propios (`card`, `surface`, `overlay`, `on-accent`), sombras parametrizadas, superficies elevadas cálidas y texto legible sobre los acentos pastel.

### Corregido
- Importación de fuentes en ejecución (bajo conectividad) reemplazada por archivos locales.