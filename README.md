# Libreta de Películas 🎬📓

Aplicación de escritorio nativa para anotar, rankear y comparar películas **en pareja**, con estética de libreta cute y colores pastel.

> "una libreta para lo que vemos juntos"

---

## ¿Qué es?

Libreta de Películas es un diario cinéfilo compartido para dos personas. Cada usuario califica las películas que vieron juntos con estrellas, un emoji de humor y una nota personal; luego pueden comparar quién la disfrutó más, ver estadísticas del historial y descubrir su película favorita en común.

Todo se guarda **localmente** en la máquina: privacidad total para la pareja, sin cuentas ni nube.

---

## ✨ Features

### Gestión de películas (CRUD)
- **Agregar / editar / eliminar** películas con: título (obligatorio), año, género, póster, notas, dónde la vieron (`En Casa` / `En el Cine`) y fecha en que la agregaron.
- **Autocompletado de póster**: mientras escribes el título, la app busca el póster automáticamente (con *debounce* de 600 ms), y rellena año, género y póster del resultado. **TMDB** como fuente principal (clave opcional en Ajustes) y **Wikipedia** como respaldo sin configuración.

### Rankeo en pareja
- Calificación de **1 a 5 estrellas** con animación *spring*.
- **Emoji de humor** (😍 Increíble … 😞 No recomiendo) para capturar la sensación subjetiva.
- **Nota personal** en tipografía manuscrita.
- Dos usuarios por defecto: **Yo** y **Mi pareja**, cada uno con su color identificativo.

### Comparación
- Vista lado a lado del rating de cada uno por película.
- Promedio de cada persona y **promedio combinado**.
- **Película favorita de cada uno**.
- Resumen de dónde la vieron (Casa 🏠 vs Cine 🎬).
- **Filas resaltadas** cuando hay diferencias de más de 1 estrella: "las mejores para debatir".

### Estadísticas
- Total de películas y calificaciones, y promedio general.
- **Histograma** de distribución de calificaciones (1 a 5 estrellas).
- Promedio **por persona**, top de cada uno y **mejor película juntos** (ambos con 4+ estrellas).
- Agrupaciones por **género**, **año** y **lugar** de visionado.

### Filtros y búsqueda
- Búsqueda por título o notas.
- Filtros por **género** y por **lugar** donde la vieron.

### Ajustes
- Editar **nombres y colores** de los dos usuarios.
- Configurar la **clave de TMDB** (mejora la búsqueda de pósters).
- **Exportar** todo a un archivo JSON para respaldo o compartir.

---

## 🛠 Stack y por qué

| Capa | Tecnología | ¿Por qué? |
| --- | --- | --- |
| Shell de escritorio | **Tauri 2** (Rust) | Binarios pequeños (~10 MB), bajo uso de memoria y alto rendimiento. Al ser 100 % local, respeta la privacidad de la pareja. |
| Frontend | **React 18 + TypeScript** | Componentes declarativos y tipado estático que evitan errores al crecer el modelo de datos (Movie, Rating, User). |
| Build | **Vite 6** | Dev server instantáneo y empaquetado rápido; es el estándar de facto para frontends Tauri. |
| Estilos | **Tailwind CSS** (paleta customizada) | Utilidades únicas (`paper`, `ink`, `pink`, `blue`, `peach`, `line`) que materializan la estética de libreta pastel sin CSS suelto. |
| Estado global | **Zustand** | Store mínimo y sin *boilerplate* (a diferencia de Redux); suficiente para un solo store con CRUD. |
| Animaciones | **Framer Motion** | Física *spring* para estrellas, entrada/salida de cards y modales; da la sensación cálida y "manuscrita". |
| Routing | **react-router-dom** (HashRouter) | Tres páginas (Inicio, Comparación, Ajustes); el hash router funciona igual en producción Tauri (file://) y en el navegador. |
| Iconos | **lucide-react** | Iconografía minimalista, consistente y ligera. |
| Backend | **Rust + Tauri commands** | CRUD y estadísticas se ejecutan nativamente; la UI solo invoca comandos tipados. |
| Persistencia | **SQLite + rusqlite** (bundled) | Base local embebida, sin servidor ni cuentas. La DB se crea/siembra en `app_data_dir`. |
| Red / serialización | **reqwest** + **serde** | Para consultar TMDB/Wikipedia y transportar los modelos entre Rust y el frontend. |
| IDs | **uuid (v4)** | Identificadores únicos para películas, ratings y usuarios. |

**Por qué Tauri y no Electron:** el producto es una utilidad íntima y liviana; Tauri ofrece el mismo frontend web pero con una huella muchísimo menor (binario pequeño, menos RAM) y mejor rendimiento en el CRUD.

**Por qué SQLite y no una API en la nube:** el dato es privado de la pareja (qué vieron, qué opinan). Guardarlo localmente elimina cuentas, costos y riesgos de fuga, y la estructura permite añadir sincronización en el futuro si se quisiera compartir entre dispositivos.

---

## 🧠 Decisiones de diseño (cómo y por qué se hicieron así las features)

### Arquitectura: capa `api.ts` con mock en navegador
El frontend no llama a Tauri directamente desde los componentes; toda la comunicación pasa por una interfaz `Api` en `src/lib/api.ts` que detecta en runtime si corre dentro de Tauri (`__TAURI_INTERNALS__`) y elige entre el backend real (comandos Rust) o un **mock con localStorage y datos de ejemplo**. Esto permite desarrollar y diseñar la UI 100 % en el navegador (`npm run dev`) *sin compilar Rust*, acelerando el ciclo de iteración.

### Backend: comando `get_movies` devuelve películas + ratings juntos
Se devuelven `MovieWithRatings` (más el flujo en `fetch_all`: una sola pasada de ratings y agrupado en memoria) para que cada card de la UI tenga a mano ambas calificaciones sin N+1 queries. Suficiente para el volumen de una pareja.

### Schema pensado para "un rating por usuario por película"
La tabla `ratings` tiene `UNIQUE(movie_id, user_id)` y el comando `save_rating` hace *upsert* (si ya calificaste, actualiza; si no, inserta). Así se evitan duplicados y la vista de pareja siempre muestra una sola fila por persona. El borrado de película propaga con `ON DELETE CASCADE` para no dejar ratings huérfanos.

### Dos usuarios sembrados con colores distintos
`db::seed()` crea "Yo" (rosa) y "Mi pareja" (turquesa) solo si no hay usuarios. Tener dos identidades diferenciadas por color es lo que hace legible de un vistazo la comparación y las estadísticas por persona, y los nombres/colores son editables en Ajustes.

### Autocompletado de póster resiliente y opcional
- Se dispara con **debounce de 600 ms** y semáforo de tokens (`searchToken`) para descartar respuestas obsoletas.
- Cadena de fuentes: **TMDB** (si configuraste la clave, mejor calidad en español) → **Wikipedia** (funciona sin clave). Result, la app es usable "out of the box" y mejorable.
- No bloquea el alta: el póster se autocompleta pero siempre puedes pegar una URL a mano.

### Comparación diseñada para conversar, no competir
Más que un ranking, la vista marca las **diferencias > 1 estrella** con fondo destacado y un mensaje: *"son las mejores para debatir"*. Refuerza el espíritu colaborativo del producto: la métrica no premia al que "acierta", sino que invita a charlar sobre gustos distintos.

### Estadísticas con "mejor película juntos"
Además de los promedios individuales, `get_stats` calcula la película con **ambos ratings ≥ 4** y mejor suma combinada: un guiño positivo que celebra el gusto compartido, coherente con el tono cálido de la app.

### Lugar de visionado como dato de pareja
`watched_at` (En Casa / En el Cine) suma recuerdos compartidos al registro y alimenta filtros y estadísticas: no es una película cualquiera, es una que *vieron juntos* en un contexto.

### Validaciones simples en el borde
El título es obligatorio y el año debe ser ≥ 1888 (año del primer cine). Se validan tanto en frontend (UX inmediata) como en backend (integridad), evitando datos basura en SQLite.

### Estética "libreta"
Inter (texto) + Poppins (títulos) + Caveat (manuscrita para notas), paleta pastel sobre fondo crema con patrón de puntos, líneas punteadas y sombras suaves (`shadow-sm`/`md`). La tipografía manuscrita en notas y subsueños refuerza el concepto de diario compartido.

---

## 🗄 Schema de la base de datos

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#d4a5a5'
);

CREATE TABLE movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER,
    genre TEXT,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    poster_url TEXT,
    notes TEXT,
    watched_at TEXT
);

CREATE TABLE ratings (
    id TEXT PRIMARY KEY,
    movie_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rating REAL NOT NULL,             -- 1.0 a 5.0
    mood TEXT,
    personal_note TEXT,
    rated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(movie_id, user_id)
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```

> `db::init` además ejecuta `ensure_column` para migraciones livianas de columnas nuevas (p. ej. `movies.watched_at`).

---

## 🚀 Cómo correrlo

### Requisitos
- Node.js 18+
- Rust toolchain (para `src-tauri`)

### En navegador (modo mock, sin compilar Rust)
```bash
npm install
npm run dev
```

### App de escritorio
```bash
npm install
npm run tauri dev        # modo desarrollo
npm run tauri build      # generar instalador
```

> La base de datos SQLite se crea automáticamente en el directorio de datos de la app (`app_data_dir`).

---

## 📁 Estructura del proyecto

```
├── src/                        # Frontend React + TS
│   ├── components/             # MovieCard, RatingSelector, MovieForm, ComparisonView, StatsBoard, Modal, Stars, MovieList
│   ├── pages/                  # Home, Comparison, Settings
│   ├── store/useMovieStore.ts  # Estado global con Zustand
│   ├── lib/
│   │   ├── api.ts              # Interfaz Api + backend real (Tauri) y mock (localStorage)
│   │   ├── constants.ts        # Emojis de humor, géneros, colores, utilidades
│   │   └── stats.ts            # Cálculo de estadísticas (cliente)
│   ├── types/index.ts          # Modelos compartidos con el backend
│   ├── App.tsx / main.tsx      # Router y arranque
│   └── index.css               # Tokens y estilos base
├── src-tauri/                  # Backend Rust
│   └── src/
│       ├── main.rs             # Builder Tauri + registro de commands
│       ├── db.rs               # Conexión, schema, seed
│       ├── models.rs           # Structs serde
│       └── commands/
│           ├── movies.rs       # get/add/update/delete movies
│           ├── ratings.rs      # get_ratings, save_rating (upsert)
│           ├── users.rs        # get_users, upsert_user
│           ├── stats.rs        # get_stats, compare_ratings
│           ├── settings.rs     # get/set setting (clave TMDB)
│           ├── poster.rs       # search_movie (TMDB + Wikipedia)
│           └── mod.rs
├── scripts/                    # Utilidades (iconos, paths de build)
├── index.html                  # Entrada web
└── tailwind.config.js          # Paleta y fuentes
```

---

## 🗺 Roadmap (ideas)

- Sincronización entre dispositivos (p. ej. un backend o sync opcional).
- Export/import con merge para respaldos.
- Búsqueda automática de pósters también en el modo mock.
- Más lugares de visionado y etiquetas personalizadas.
- Modo oscuro "libreta nocturna" 🌙.

---

Hecha con cariño, para ustedes dos. 💕