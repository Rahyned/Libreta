import { create } from "zustand";
import { api } from "../lib/api";
import type {
  MovieInput,
  MovieWithRatings,
  RatingInput,
  User,
} from "../types";

interface MovieState {
  movies: MovieWithRatings[];
  users: User[];
  loading: boolean;
  error: string | null;
  meId: string | null;
  partnerId: string | null;
  load: () => Promise<void>;
  addMovie: (input: MovieInput) => Promise<MovieWithRatings>;
  updateMovie: (id: string, input: MovieInput) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;
  saveRating: (input: RatingInput) => Promise<void>;
  setWatched: (id: string, watched: boolean) => Promise<void>;
  updateUser: (id: string, name: string, color: string) => Promise<void>;
  clearError: () => void;
}

export const useMovieStore = create<MovieState>((set, get) => ({
  movies: [],
  users: [],
  loading: false,
  error: null,
  meId: null,
  partnerId: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const [users, movies] = await Promise.all([
        api.getUsers(),
        api.getMovies(),
      ]);
      set({
        users,
        movies,
        meId: users[0]?.id ?? null,
        partnerId: users[1]?.id ?? null,
        loading: false,
      });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  addMovie: async (input) => {
    const created = await api.addMovie(input);
    set((s) => ({ movies: [created, ...s.movies] }));
    return created;
  },

  updateMovie: async (id, input) => {
    const updated = await api.updateMovie(id, input);
    set((s) => ({
      movies: s.movies.map((m) => (m.movie.id === id ? updated : m)),
    }));
  },

  deleteMovie: async (id) => {
    await api.deleteMovie(id);
    set((s) => ({ movies: s.movies.filter((m) => m.movie.id !== id) }));
  },

  saveRating: async (input) => {
    await api.saveRating(input);
    await get().load();
  },

  setWatched: async (id, watched) => {
    const current = get().movies.find((m) => m.movie.id === id)?.movie;
    if (!current) return;
    const updated = await api.updateMovie(id, {
      title: current.title,
      year: current.year,
      genre: current.genre,
      poster_url: current.poster_url,
      notes: current.notes,
      watched_at: watched ? current.watched_at : null,
      added_date: current.added_date,
      watched,
    });
    set((s) => ({
      movies: s.movies.map((m) => (m.movie.id === id ? { ...m, movie: updated.movie } : m)),
    }));
  },

  updateUser: async (id, name, color) => {
    const updated = await api.upsertUser(id, name, color);
    set((s) => ({ users: s.users.map((u) => (u.id === id ? updated : u)) }));
  },

  clearError: () => set({ error: null }),
}));
