# Prompt: App Tauri - Libreta de Películas con Pareja

## OBJETIVO
Crear una aplicación de escritorio nativa (Tauri) para anotar, rankear y compartir películas vistas en pareja. Estética visual: libreta cute con colores pasteles.

---

## STACK TÉCNICO

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS (customizado con paleta pastel)
- Framer Motion (animaciones sutiles)
- Lucide Icons (iconografía minimalista)
- Zustand (state management ligero)

**Backend:**
- Tauri 2.0
- Rust (Tauri commands para CRUD)
- SQLite (base de datos local)
- Serde (serialización)

**Fuentes:**
- Body: Inter 400/500/600
- Títulos: Poppins 600/700
- Notas/anotaciones: Caveat 400 (manuscrita suave)

---

## PALETA DE COLORES (Pastel + Libreta)

```
--paper-bg: #fdfbf7          // Fondo principal (papel crema)
--text-primary: #4a3728      // Texto marrón cálido
--text-secondary: #8b7355    // Texto secundario gris-marrón
--accent-pink: #d4a5a5       // Rosa pastel (CTA, highlights)
--accent-blue: #a8d5d5       // Turquesa pastel (secundario)
--accent-peach: #ffe4d4      // Naranja muy pastel (avisos)
--border-line: #e8dcc8       // Beige para bordes/líneas
--error: #d88888             // Rojo pastel suave
--success: #a8d0a8           // Verde pastel suave

// Sombras sutiles
--shadow-sm: 0 1px 3px rgba(74,55,40,0.08)
--shadow-md: 0 4px 12px rgba(74,55,40,0.12)
```

---

## ESTRUCTURA DEL PROYECTO

```
movie-libreta/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs              // Setup Tauri
│   │   ├── db.rs                // Conexión SQLite
│   │   ├── models.rs            // Structs Movie, Rating, User
│   │   └── commands/
│   │       ├── movies.rs        // get_movies, add_movie, delete_movie
│   │       ├── ratings.rs       // add_rating, update_rating, get_ratings
│   │       └── stats.rs         // get_stats, compare_ratings
│   └── tauri.conf.json
│
├── src/
│   ├── components/
│   │   ├── MovieCard.tsx        // Card individual película
│   │   ├── RatingSelector.tsx   // Stars animadas + mood slider
│   │   ├── MovieForm.tsx        // Form agregar película
│   │   ├── MovieList.tsx        // List principales
│   │   ├── ComparisonView.tsx   // Ratings yo vs pareja
│   │   └── StatsBoard.tsx       // Gráficas y estadísticas
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Settings.tsx
│   │   └── Comparison.tsx
│   ├── store/
│   │   └── useMovieStore.ts     // Zustand store
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── tailwind.config.js   // Customización paleta
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│   └── index.html
└── package.json
```

---

## SCHEMA BASE DE DATOS (SQLite)

```sql
-- Tabla usuarios
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#d4a5a5'
);

-- Tabla películas
CREATE TABLE movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER,
    genre TEXT,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    poster_url TEXT,
    notes TEXT
);

-- Tabla ratings (cada usuario rankea cada película)
CREATE TABLE ratings (
    id TEXT PRIMARY KEY,
    movie_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rating REAL (1.0-5.0),
    mood TEXT (fuerte recomendación: emoji + texto), 
    personal_note TEXT,
    rated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(movie_id) REFERENCES movies(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(movie_id, user_id)
);
```

---

## FUNCIONALIDADES MVP

### Core:
- ✅ **Agregar película:** Form modal (título, año, género, poster URL)
- ✅ **Rankear película:** 1-5 estrellas animadas, notas personales
- ✅ **Ver historial:** List de películas con ratings de ambos
- ✅ **Modo comparación:** Rating yo vs pareja lado a lado
- ✅ **Estadísticas:** Promedio ratings, películas por año/género

### Nice to have:
- Emoji mood (😍 increíble, 😐 regular, 😞 no recomiendo)
- Filtros por género/año/rating
- Búsqueda
- Exportar datos (CSV/JSON)

---

## COMPONENTES A IMPLEMENTAR

### 1. **MovieCard**
```tsx
Props: {
  movie: Movie
  myRating: Rating | null
  partnerRating: Rating | null
  onEdit: () => void
  onDelete: () => void
}
```
- Layout: Título + año + género arriba
- Ratings debajo: Nombre usuario + estrellas animadas
- Icono emoji mood en esquina
- Hover: sombra suave, fondo levemente más oscuro

### 2. **RatingSelector**
```tsx
Props: {
  initialRating?: number
  onSubmit: (rating: number, mood: string, note: string) => void
  userName: string
}
```
- 5 estrellas clickeables (animación on hover)
- Emoji mood selector (grilla 3x2)
- Textarea para nota personal
- Botón "Guardar" pastel

### 3. **MovieForm**
```tsx
Props: {
  onSubmit: (movie: MovieInput) => void
  onCancel: () => void
}
```
- Campos: Título (req), Año, Género (select), Poster URL
- Validación básica
- Animación entrada suave (fade + scale)

### 4. **ComparisonView**
```tsx
Props: {
  movies: Movie[]
  ratings: Rating[]
  users: User[]
}
```
- Dos columnas: "Yo" vs "Mi pareja"
- Diferencias destacadas (si ratings varían >1)
- Película que más gustó a cada uno
- Promedio combinado

### 5. **StatsBoard**
- Gráfica: Ratings distribuidos (histograma pastel)
- Promedio general
- Película top de cada uno
- "Mejor película juntos" (ambos ≥4 estrellas)

---

## ESPECIFICACIONES DE DISEÑO (LIBRETA)

### Tipografía:
```css
h1 { font-family: Poppins; font-size: 2rem; font-weight: 700; color: #4a3728; }
h2 { font-family: Poppins; font-size: 1.5rem; font-weight: 600; color: #4a3728; }
body { font-family: Inter; font-size: 1rem; color: #8b7355; line-height: 1.6; }
.handwritten { font-family: Caveat; font-size: 1.1rem; color: #4a3728; }
```

### Elementos de libreta:
- **Líneas decorativas:** `border-b border-dashed border-[#e8dcc8]` entre secciones
- **Márgenes:** Padding generoso (~2rem) en contenedor principal
- **Papel texturizado:** Fondo con patrón sutilísimo (opacity 3-5%)
- **Esquinas redondeadas:** Bordes suaves (border-radius: 12-16px)
- **Sombras:** Siempre `shadow-sm` o `shadow-md` (nunca agresivas)

### Animaciones:
- Fade-in: 300ms ease-out
- Stars rating: Spring physics (tension 200, friction 20)
- Emoji mood: Bounce suave (scale 1 → 1.2 → 1)
- Delete: Fade-out + slide-left 200ms

---

## INSTRUCCIONES DE IMPLEMENTACIÓN

### Phase 1: Setup Base
1. Inicializar proyecto Tauri: `cargo tauri init`
2. Configurar Tailwind con paleta customizada
3. Crear estructura de carpetas (ver arriba)
4. Importar fuentes (Google Fonts o local)

### Phase 2: Backend (Rust)
1. Implementar conexión SQLite + schema
2. Crear Tauri commands CRUD para movies/ratings
3. Comandos de utilidad (stats, comparación)

### Phase 3: Frontend (React)
1. Implementar components (MovieCard → RatingSelector → MovieForm)
2. Conectar Zustand store con Tauri commands
3. Rutas principales (Home, Comparison, Settings)
4. Animaciones Framer Motion

### Phase 4: Polish
1. Validaciones formularios
2. Error handling + toasts
3. Responsive (desktop first, pero testear en 1024px+)
4. Testing componentes

---

## TONO Y VIBE

- **Cute pero no infantil:** Estética soft, accesible, acogedora
- **Minimalista funcional:** Menos es más, cada elemento tiene propósito
- **Cálido:** Colores tierra + pasteles suaves, evitar frialdad
- **Colaborativo:** UX pensado para pareja (no competencia, sí comparación divertida)

**Referencia visual:** Notion aesthetic + Apple Notes + Moleskine libreta

---

## DATOS DE EJEMPLO (Testing)

```json
{
  "users": [
    { "id": "user1", "name": "Yo", "color": "#d4a5a5" },
    { "id": "user2", "name": "Mi pareja", "color": "#a8d5d5" }
  ],
  "movies": [
    {
      "id": "m1",
      "title": "Oppenheimer",
      "year": 2023,
      "genre": "Drama",
      "poster_url": "https://...",
      "notes": "Película épica y hermosa"
    }
  ],
  "ratings": [
    {
      "id": "r1",
      "movie_id": "m1",
      "user_id": "user1",
      "rating": 4.5,
      "mood": "😍 Increíble",
      "personal_note": "Ficción histórica de otra liga"
    }
  ]
}
```

---

## NOTAS FINALES

- **Persistencia:** SQLite local, sin cloud (mantiene privacidad pareja)
- **Performance:** Tauri es rápido, no preocupa. React lazy-loading si hay 100+ películas
- **Escalabilidad:** Estructura permite agregar sync en el futuro (si quieren compartir entre dispositivos)
- **Desarrollo iterativo:** MVP es funcional en 2-3 sprints. Features nice-to-have después

---

**¿Listo para usar este prompt con Claude Code o la herramienta de IA de tu elección. Genera primero estructura base + componentes React, luego backend Rust.**
busca en todas las skills disponibles que tengas
