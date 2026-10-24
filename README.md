# Libreta de Películas y Series

**Diario de escritorio para anotar, puntuar y comparar en pareja las películas y series que ven juntos. Todo queda en la computadora, sin cuentas ni nube.**

## El problema

Llevar registro de lo que se vio en pareja y de qué le pareció a cada uno, sin entregar esos datos a un servicio externo.

## Qué hace

- **Películas y series:** alta, edición y baja, con año, género, póster, notas y dónde se vio (casa o cine). Para series, además, temporadas y estado.
- **Autocompletado de pósters:** busca mientras escribís, con TMDB (clave opcional) y Wikipedia como respaldo sin configuración.
- **Puntuación por persona:** de 1 a 5 estrellas, emoji de ánimo y nota personal manuscrita.
- **Comparación lado a lado:** promedios, favorito de cada uno y resaltado de los títulos con más de una estrella de diferencia ("los mejores para debatir").
- **Estadísticas:** histograma de puntuaciones, promedios por persona, mejor título en común y agrupaciones por género, año y lugar.
- **Búsqueda, filtros, watchlist** y exportación a JSON.

## Stack

| Capa | Tecnología |
| --- | --- |
| Escritorio | Tauri 2 (Rust) |
| Frontend | React 18, TypeScript, Vite, Tailwind, Zustand, Framer Motion |
| Datos | SQLite local (rusqlite) |
| Pósters | TMDB + Wikipedia (reqwest/serde) |

**¿Por qué Tauri y SQLite?** Es una app íntima y liviana: binario chico, poco consumo de memoria y datos privados que nunca salen de la máquina.

## Decisiones de diseño

- Una capa `api.ts` detecta si corre dentro de Tauri o en el navegador. En el navegador usa un mock con `localStorage`, así la interfaz se desarrolla sin compilar Rust.
- Un solo puntaje por persona y título (`UNIQUE(movie_id, user_id)` + upsert), y borrado en cascada de los puntajes.
- Validaciones en frontend y backend: título obligatorio y año desde 1888.

## Cómo correrlo

Requisitos: Node.js 18+ y Rust.

```bash
npm install
npm run dev          # en el navegador, con datos de ejemplo
npm run tauri dev    # app de escritorio
npm run tauri build  # instalador
```

## Estado

En desarrollo (2026). App funcional. Próximas ideas: sincronización entre dispositivos, importación con merge, modo oscuro y puntuación por temporada.

## Autor

Lautaro Rodríguez · [GitHub](https://github.com/Rahyned)
