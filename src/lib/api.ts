import { invoke } from "@tauri-apps/api/core";
import type {
  BackupResult,
  MediaKind,
  Movie,
  MovieInput,
  MovieSearchResult,
  MovieWithRatings,
  Rating,
  RatingInput,
  User,
} from "../types";

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export interface Api {
  getUsers(): Promise<User[]>;
  upsertUser(id: string, name: string, color: string): Promise<User>;
  getMovies(): Promise<MovieWithRatings[]>;
  addMovie(input: MovieInput): Promise<MovieWithRatings>;
  updateMovie(id: string, input: MovieInput): Promise<MovieWithRatings>;
  deleteMovie(id: string): Promise<void>;
  saveRating(input: RatingInput): Promise<Rating>;
  searchMovie(
    title: string,
    year?: number | null,
    kind?: MediaKind
  ): Promise<MovieSearchResult[]>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  exportBackup(): Promise<string>;
  importBackup(contents: string): Promise<BackupResult>;
  writeBackupFile(path: string, contents: string): Promise<void>;
  readBackupFile(path: string): Promise<string>;
}

// ---------------------------------------------------------------------------
// Real backend (Tauri commands)
// ---------------------------------------------------------------------------
const realApi: Api = {
  getUsers: () => invoke<User[]>("get_users"),
  upsertUser: (id, name, color) =>
    invoke<User>("upsert_user", { id, name, color }),
  getMovies: () => invoke<MovieWithRatings[]>("get_movies"),
  addMovie: (input) => invoke<MovieWithRatings>("add_movie", { input }),
  updateMovie: (id, input) =>
    invoke<MovieWithRatings>("update_movie", { id, input }),
  deleteMovie: (id) => invoke<void>("delete_movie", { id }),
  saveRating: (input) => invoke<Rating>("save_rating", { input }),
  searchMovie: (title, year, kind) =>
    invoke<MovieSearchResult[]>("search_movie", { title, year, kind }),
  getSetting: (key) => invoke<string | null>("get_setting", { key }),
  setSetting: (key, value) => invoke<void>("set_setting", { key, value }),
  exportBackup: () => invoke<string>("export_backup"),
  importBackup: (contents) =>
    invoke<BackupResult>("import_backup", { contents }),
  writeBackupFile: (path, contents) =>
    invoke<void>("write_backup_file", { path, contents }),
  readBackupFile: (path) => invoke<string>("read_backup_file", { path }),
};

// ---------------------------------------------------------------------------
// Mock backend (browser dev, localStorage + sample data)
// ---------------------------------------------------------------------------
const STORAGE_KEY = "movie-libreta:data";

interface MockDb {
  users: User[];
  movies: Movie[];
  ratings: Rating[];
}

const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const now = (): string =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

function sampleDb(): MockDb {
  const users: User[] = [
    { id: "user1", name: "Yo", color: "#d4a5a5" },
    { id: "user2", name: "Mi pareja", color: "#a8d5d5" },
  ];

  const movies: Movie[] = [
    {
      id: "m1",
      title: "Oppenheimer",
      year: 2023,
      genre: "Drama",
      added_date: "2026-08-16 12:00:00",
      poster_url: null,
      notes: "Película épica y hermosa",
      watched_at: "En el Cine",
      watched: true,
      kind: "movie",
      seasons: null,
      status: null,
    },
    {
      id: "m2",
      title: "Everything Everywhere All at Once",
      year: 2022,
      genre: "Ciencia ficción",
      added_date: "2026-08-15 12:00:00",
      poster_url: null,
      notes: null,
      watched_at: "En Casa",
      watched: true,
      kind: "movie",
      seasons: null,
      status: null,
    },
    {
      id: "m3",
      title: "In the Mood for Love",
      year: 2000,
      genre: "Romance",
      added_date: "2026-08-14 12:00:00",
      poster_url: null,
      notes: "Wong Kar-wai en su máxima elegancia",
      watched_at: "En Casa",
      watched: true,
      kind: "movie",
      seasons: null,
      status: null,
    },
    {
      id: "m4",
      title: "Spirited Away",
      year: 2001,
      genre: "Animación",
      added_date: "2026-08-13 12:00:00",
      poster_url: null,
      notes: "La vimos mil veces y no cansa",
      watched_at: "En Casa",
      watched: true,
      kind: "movie",
      seasons: null,
      status: null,
    },
    {
      id: "s1",
      title: "The Bear",
      year: 2022,
      genre: "Comedia",
      added_date: "2026-08-12 12:00:00",
      poster_url: null,
      notes: "La cocina y la ansiedad, nada más",
      watched_at: "En Casa",
      watched: true,
      kind: "series",
      seasons: 3,
      status: "Completada",
    },
    {
      id: "s2",
      title: "Arcane",
      year: 2021,
      genre: "Animación",
      added_date: "2026-08-11 12:00:00",
      poster_url: null,
      notes: null,
      watched_at: "En Casa",
      watched: true,
      kind: "series",
      seasons: 2,
      status: "En curso",
    },
  ];

  const ratings: Rating[] = [
    {
      id: "r1",
      movie_id: "m1",
      user_id: "user1",
      rating: 4.5,
      mood: "😍 Increíble",
      personal_note: "Ficción histórica de otra liga",
      rated_date: "2026-08-16 12:00:00",
    },
    {
      id: "r2",
      movie_id: "m1",
      user_id: "user2",
      rating: 4,
      mood: "🙂 Me gustó",
      personal_note: null,
      rated_date: "2026-08-16 12:00:00",
    },
    {
      id: "r3",
      movie_id: "m2",
      user_id: "user1",
      rating: 5,
      mood: "😍 Increíble",
      personal_note: "Me rompió la cabeza",
      rated_date: "2026-08-15 12:00:00",
    },
    {
      id: "r4",
      movie_id: "m2",
      user_id: "user2",
      rating: 4.5,
      mood: "😄 Me encantó",
      personal_note: null,
      rated_date: "2026-08-15 12:00:00",
    },
    {
      id: "r5",
      movie_id: "m3",
      user_id: "user1",
      rating: 4.5,
      mood: "😍 Increíble",
      personal_note: "Fotografía perfecta",
      rated_date: "2026-08-14 12:00:00",
    },
    {
      id: "r6",
      movie_id: "m3",
      user_id: "user2",
      rating: 3,
      mood: "😐 Regular",
      personal_note: "Muy lenta para mí",
      rated_date: "2026-08-14 12:00:00",
    },
    {
      id: "r7",
      movie_id: "m4",
      user_id: "user1",
      rating: 5,
      mood: "😍 Increíble",
      personal_note: "Obra maestra de Miyazaki",
      rated_date: "2026-08-13 12:00:00",
    },
    {
      id: "r8",
      movie_id: "m4",
      user_id: "user2",
      rating: 5,
      mood: "😍 Increíble",
      personal_note: "Nuestra favorita",
      rated_date: "2026-08-13 12:00:00",
    },
    {
      id: "r9",
      movie_id: "s1",
      user_id: "user1",
      rating: 4.5,
      mood: "😄 Me encantó",
      personal_note: "Carmy y su equipo",
      rated_date: "2026-08-12 12:00:00",
    },
    {
      id: "r10",
      movie_id: "s1",
      user_id: "user2",
      rating: 4,
      mood: "🙂 Me gustó",
      personal_note: null,
      rated_date: "2026-08-12 12:00:00",
    },
    {
      id: "r11",
      movie_id: "s2",
      user_id: "user1",
      rating: 5,
      mood: "😍 Increíble",
      personal_note: "Obra maestra animada",
      rated_date: "2026-08-11 12:00:00",
    },
    {
      id: "r12",
      movie_id: "s2",
      user_id: "user2",
      rating: 4.5,
      mood: "😍 Increíble",
      personal_note: null,
      rated_date: "2026-08-11 12:00:00",
    },
  ];

  return { users, movies, ratings };
}

function loadMock(): MockDb {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as MockDb;
    } catch {
      /* fall through to sample */
    }
  }
  const db = sampleDb();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  return db;
}

function saveMock(db: MockDb): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

const SETTINGS_KEY = "movie-libreta:settings";

function loadSettings(): Record<string, string> {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      /* fall through */
    }
  }
  return {};
}

function saveSettings(s: Record<string, string>): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

async function mockSearchPoster(
  title: string,
  _year?: number | null,
  kind?: MediaKind
): Promise<MovieSearchResult[]> {
  const q = title.trim();
  if (!q) return [];

  const isSeries = kind === "series";
  const variants = isSeries
    ? [q, `${q} (TV series)`, `${q} (serie de televisión)`]
    : [q, `${q} (film)`, `${q} (película)`];

  for (const wiki of ["en", "es"]) {
    const url = `https://${wiki}.wikipedia.org/w/api.php`;
    for (const variant of variants) {
      const params = new URLSearchParams({
        action: "query",
        titles: variant,
        prop: "pageimages",
        pithumbsize: "500",
        redirects: "1",
        format: "json",
        origin: "*",
      });
      try {
        const res = await fetch(`${url}?${params.toString()}`);
        if (!res.ok) continue;
        const data = await res.json();
        const pages: Record<string, any> = data?.query?.pages ?? {};
        for (const page of Object.values(pages)) {
          if (page?.thumbnail?.source) {
            return [
              {
                poster_url: page.thumbnail.source,
                title: page.title ?? q,
                year: null,
                genres: [],
                source: "wikipedia",
              },
            ];
          }
        }
      } catch {
        /* try next variant/wiki */
      }
    }
  }
  return [];
}

const mockApi: Api = {
  getUsers: async () => loadMock().users,

  upsertUser: async (id, name, color) => {
    const db = loadMock();
    let user = db.users.find((u) => u.id === id);
    if (user) {
      user = { ...user, name, color };
      db.users = db.users.map((u) => (u.id === id ? user! : u));
    } else {
      user = { id, name, color };
      db.users.push(user);
    }
    saveMock(db);
    return user;
  },

  getMovies: async () => {
    const db = loadMock();
    return db.movies.map((movie) => ({
      movie: {
        ...movie,
        kind: movie.kind ?? "movie",
        seasons: movie.seasons ?? null,
        status: movie.status ?? null,
      },
      ratings: db.ratings.filter((r) => r.movie_id === movie.id),
    }));
  },

  addMovie: async (input) => {
    const db = loadMock();
    const movie: Movie = {
      id: uid(),
      title: input.title.trim(),
      year: input.year ?? null,
      genre: input.genre ?? null,
      added_date: input.added_date ?? now(),
      poster_url: input.poster_url ?? null,
      notes: input.notes ?? null,
      watched_at: input.watched_at ?? null,
      watched: input.watched ?? true,
      kind: input.kind ?? "movie",
      seasons: input.seasons ?? null,
      status: input.status ?? null,
    };
    db.movies.unshift(movie);
    saveMock(db);
    return { movie, ratings: [] };
  },

  updateMovie: async (id, input) => {
    const db = loadMock();
    const idx = db.movies.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error("Película no encontrada");
    db.movies[idx] = {
      ...db.movies[idx],
      title: input.title.trim(),
      year: input.year ?? null,
      genre: input.genre ?? null,
      poster_url: input.poster_url ?? null,
      notes: input.notes ?? null,
      watched_at: input.watched_at ?? null,
      added_date: input.added_date ?? db.movies[idx].added_date,
      watched: input.watched ?? db.movies[idx].watched,
      kind: input.kind ?? db.movies[idx].kind ?? "movie",
      seasons: input.seasons ?? db.movies[idx].seasons ?? null,
      status: input.status ?? db.movies[idx].status ?? null,
    };
    saveMock(db);
    return {
      movie: db.movies[idx],
      ratings: db.ratings.filter((r) => r.movie_id === id),
    };
  },

  deleteMovie: async (id) => {
    const db = loadMock();
    db.movies = db.movies.filter((m) => m.id !== id);
    db.ratings = db.ratings.filter((r) => r.movie_id !== id);
    saveMock(db);
  },

  saveRating: async (input) => {
    const db = loadMock();
    const existing = db.ratings.find(
      (r) => r.movie_id === input.movie_id && r.user_id === input.user_id
    );
    if (existing) {
      existing.rating = input.rating;
      existing.mood = input.mood ?? null;
      existing.personal_note = input.personal_note ?? null;
      existing.rated_date = now();
      saveMock(db);
      return existing;
    }
    const rating: Rating = {
      id: uid(),
      movie_id: input.movie_id,
      user_id: input.user_id,
      rating: input.rating,
      mood: input.mood ?? null,
      personal_note: input.personal_note ?? null,
      rated_date: now(),
    };
    db.ratings.push(rating);
    saveMock(db);
    return rating;
  },

  searchMovie: mockSearchPoster,

  getSetting: async (key) => {
    const s = loadSettings();
    return s[key] ?? null;
  },

  setSetting: async (key, value) => {
    const s = loadSettings();
    s[key] = value;
    saveSettings(s);
  },

  exportBackup: async () => {
    const db = loadMock();
    return JSON.stringify({
      app: "movie-libreta",
      schemaVersion: 1,
      users: db.users,
      movies: db.movies,
      ratings: db.ratings,
    });
  },

  importBackup: async (contents) => {
    const data = JSON.parse(contents) as {
      users?: User[];
      movies?: Movie[];
      ratings?: Rating[];
    };
    const db = loadMock();
    let users_imported = 0;
    let movies_imported = 0;
    let movies_merged = 0;
    let ratings_imported = 0;

    const movieMap = new Map<string, string>();

    for (const u of data.users ?? []) {
      if (db.users.some((x) => x.id === u.id) || !u.id) continue;
      db.users.push(u);
      users_imported++;
    }

    for (const m of data.movies ?? []) {
      if (!m.title?.trim()) continue;
      const kind = m.kind ?? "movie";
      const dup = db.movies.find(
        (x) =>
          x.id === m.id ||
          (x.title.toLowerCase() === m.title.toLowerCase() &&
            x.year === m.year &&
            (x.kind ?? "movie") === kind)
      );
      if (dup) {
        movieMap.set(m.id, dup.id);
        movies_merged++;
        continue;
      }
      const fresh: Movie = {
        ...m,
        id: uid(),
        kind,
        seasons: m.seasons ?? null,
        status: m.status ?? null,
      };
      db.movies.unshift(fresh);
      movieMap.set(m.id, fresh.id);
      movies_imported++;
    }

    for (const r of data.ratings ?? []) {
      const movieId = movieMap.get(r.movie_id);
      if (!movieId || !db.users.some((u) => u.id === r.user_id)) continue;
      if (db.ratings.some((x) => x.movie_id === movieId && x.user_id === r.user_id)) continue;
      db.ratings.push({
        ...r,
        id: uid(),
        movie_id: movieId,
        rating: Math.min(5, Math.max(1, r.rating)),
      });
      ratings_imported++;
    }

    saveMock(db);
    return { users_imported, movies_imported, movies_merged, ratings_imported };
  },

  writeBackupFile: async () => {
    throw new Error("Solo disponible en la app de escritorio");
  },

  readBackupFile: async () => {
    throw new Error("Solo disponible en la app de escritorio");
  },
};

export const api: Api = isTauri() ? realApi : mockApi;
