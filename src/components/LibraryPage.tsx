import { motion } from "framer-motion";
import { BarChart3, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import MovieForm from "./MovieForm";
import MovieList from "./MovieList";
import Modal from "./Modal";
import RatingSelector from "./RatingSelector";
import StatsBoard from "./StatsBoard";
import { GENRES, WATCHED_AT_OPTIONS } from "../lib/constants";
import { computeStats } from "../lib/stats";
import { useMovieStore } from "../store/useMovieStore";
import type { MediaKind, Movie, MovieInput, RatingInput } from "../types";

interface Props {
  kind: MediaKind;
}

export default function LibraryPage({ kind }: Props) {
  const {
    movies,
    users,
    loading,
    error,
    load,
    addMovie,
    updateMovie,
    deleteMovie,
    saveRating,
  } = useMovieStore();

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [place, setPlace] = useState("");
  const [showStats, setShowStats] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editMovie, setEditMovie] = useState<Movie | null>(null);
  const [rateMovie, setRateMovie] = useState<Movie | null>(null);
  const [deleteMovieId, setDeleteMovieId] = useState<string | null>(null);

  const isMovie = kind === "movie";

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onAdd = (e: Event) => {
      const detail = (e as CustomEvent<{ kind?: MediaKind } | undefined>).detail;
      if (!detail || !detail.kind || detail.kind === kind) setAddOpen(true);
    };
    window.addEventListener("libreta:add-movie", onAdd);
    return () => window.removeEventListener("libreta:add-movie", onAdd);
  }, [kind]);

  const watchedMovies = useMemo(
    () => movies.filter((m) => (m.movie.kind ?? "movie") === kind && m.movie.watched),
    [movies, kind]
  );

  const stats = useMemo(
    () => computeStats(watchedMovies, users),
    [watchedMovies, users]
  );

  const genreOptions = useMemo(() => {
    const set = new Set<string>(GENRES);
    for (const { movie } of watchedMovies) {
      if (movie.genre) set.add(movie.genre);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [watchedMovies]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return movies.filter(({ movie }) => {
      if ((movie.kind ?? "movie") !== kind) return false;
      if (!movie.watched) return false;
      const matchesSearch =
        !q ||
        movie.title.toLowerCase().includes(q) ||
        (movie.notes ?? "").toLowerCase().includes(q);
      const matchesGenre = !genre || (movie.genre ?? "").includes(genre);
      const matchesPlace = !place || (movie.watched_at ?? "") === place;
      return matchesSearch && matchesGenre && matchesPlace;
    });
  }, [movies, search, genre, place, kind]);

  const ratedMovie = useMemo(() => {
    if (!rateMovie) return null;
    return movies.find((m) => m.movie.id === rateMovie.id) ?? null;
  }, [rateMovie, movies]);

  const handleAdd = async (input: MovieInput) => {
    const created = await addMovie(input);
    setAddOpen(false);
    if (created && created.movie.watched) setRateMovie(created.movie);
  };

  const handleEdit = async (input: MovieInput) => {
    if (editMovie) await updateMovie(editMovie.id, input);
    setEditMovie(null);
  };

  const handleRate = async (input: RatingInput) => {
    await saveRating(input);
    setRateMovie(null);
  };

  const handleDelete = async () => {
    if (deleteMovieId) await deleteMovie(deleteMovieId);
    setDeleteMovieId(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {isMovie ? "Nuestras películas" : "Nuestras series"}
          </h1>
          <p className="font-handwritten text-xl text-ink-soft">
            una libreta para lo que vemos juntos
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-accent-ink shadow-sm transition hover:bg-pink-deep"
        >
          <Plus size={16} />
          {isMovie ? "Agregar película" : "Agregar serie"}
        </button>
      </header>

      {/* Stats toggle + board */}
      {stats.totalMovies > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowStats((s) => !s)}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            <BarChart3 size={16} />
            {showStats ? "Ocultar estadísticas" : "Ver estadísticas"}
          </button>
          {showStats && <StatsBoard stats={stats} kind={kind} />}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isMovie ? "Buscar película o nota…" : "Buscar serie o nota…"}
            className="w-full rounded-full border border-line bg-surface/70 py-2 pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-pink"
          />
        </div>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="rounded-full border border-line bg-surface/70 px-3 py-2 text-sm text-ink outline-none transition focus:border-pink"
        >
          <option value="">Todos los géneros</option>
          {genreOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          className="rounded-full border border-line bg-surface/70 px-3 py-2 text-sm text-ink outline-none transition focus:border-pink"
        >
          <option value="">Todos los lugares</option>
          {WATCHED_AT_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Error / loading */}
      {error && (
        <p className="mb-4 rounded-xl bg-error/15 px-4 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {loading && movies.length === 0 ? (
        <p className="py-16 text-center text-ink-soft">Cargando…</p>
      ) : (
        <MovieList
          movies={filtered}
          users={users}
          onRate={(m) => setRateMovie(m)}
          onEdit={(m) => setEditMovie(m)}
          onDelete={(id) => setDeleteMovieId(id)}
        />
      )}

      {/* Modals */}
      <MovieForm
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        kind={kind}
      />
      <MovieForm
        open={!!editMovie}
        onClose={() => setEditMovie(null)}
        onSubmit={handleEdit}
        initial={editMovie}
      />
      {rateMovie && ratedMovie && (
        <RatingSelector
          open={!!rateMovie}
          movie={rateMovie}
          users={users}
          ratings={ratedMovie.ratings}
          onSubmit={handleRate}
          onClose={() => setRateMovie(null)}
        />
      )}

      <Modal
        open={!!deleteMovieId}
        onClose={() => setDeleteMovieId(null)}
        title={isMovie ? "Eliminar película" : "Eliminar serie"}
      >
        <p className="text-sm text-ink-soft">
          ¿Seguro que quieres eliminar {isMovie ? "esta película" : "esta serie"} y
          sus calificaciones?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setDeleteMovieId(null)}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-line/50"
          >
            Cancelar
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleDelete}
            className="rounded-full bg-error-deep px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            Eliminar
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}