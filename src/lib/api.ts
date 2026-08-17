import { invoke } from "@tauri-apps/api/core";
import type {
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
  searchMovie(title: string, year?: number | null): Promise<MovieSearchResult | null>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
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
  searchMovie: (title, year) =>
    invoke<MovieSearchResult | null>("search_movie", { title, year }),
  getSetting: (key) => invoke<string | null>("get_setting", { key }),
  setSetting: (key, value) => invoke<void>("set_setting", { key, value }),
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
  _year?: number | null
): Promise<MovieSearchResult | null> {
  const q = title.trim();
  if (!q) return null;

  const variants = [q, `${q} (film)`, `${q} (película)`];

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
            return {
              poster_url: page.thumbnail.source,
              title: page.title ?? q,
              year: null,
              genres: [],
              source: "wikipedia",
            };
          }
        }
      } catch {
        /* try next variant/wiki */
      }
    }
  }
  return null;
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
      movie,
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
};

export const api: Api = isTauri() ? realApi : mockApi;
