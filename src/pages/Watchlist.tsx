import { motion } from "framer-motion";
import { Eye, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import MovieForm from "../components/MovieForm";
import { formatDate } from "../lib/constants";
import { useMovieStore } from "../store/useMovieStore";
import type { Movie, MovieInput } from "../types";

export default function Watchlist() {
  const { movies, users, load, setWatched, deleteMovie, addMovie } =
    useMovieStore();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const watchlist = useMemo(
    () => movies.filter((m) => !m.movie.watched),
    [movies]
  );

  const handleAdd = async (input: MovieInput) => {
    await addMovie(input);
    setAddOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            Watchlist
          </h1>
          <p className="font-handwritten text-xl text-ink-soft">
            lo que falta por ver
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:bg-pink-deep"
        >
          <Plus size={16} />
          Agregar a la watchlist
        </button>
      </header>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-white/50 py-16 text-center">
          <Eye size={40} className="mb-3 text-line" />
          <p className="font-display font-semibold text-ink">
            Watchlist vacía
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Agrega películas que quieran ver más adelante.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlist.map(({ movie }) => (
            <motion.div
              key={movie.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="paper-card flex items-center gap-4 p-3"
            >
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-gradient-to-br from-pink/40 to-blue/40">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-ink/60">
                    {(movie.title.trim().charAt(0) || "?").toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-base font-semibold text-ink">
                  {movie.title}
                </h3>
                <p className="text-xs text-ink-soft">
                  {[movie.year, movie.genre].filter(Boolean).join(" · ")}
                  {movie.year || movie.genre ? " · " : ""}
                  {formatDate(movie.added_date)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setWatched(movie.id, true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue px-3 py-1.5 text-xs font-semibold text-ink shadow-sm transition hover:bg-blue-deep"
                >
                  <Eye size={13} />
                  Marcar como vista
                </button>
                <button
                  onClick={() => setDeleteId(movie.id)}
                  className="rounded-full p-1.5 text-ink-soft transition hover:bg-error/20 hover:text-error"
                  aria-label="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <MovieForm open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAdd} />

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Eliminar de la watchlist"
      >
        <p className="text-sm text-ink-soft">
          ¿Quieres eliminar esta película de la watchlist?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setDeleteId(null)}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-line/50"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              if (deleteId) await deleteMovie(deleteId);
              setDeleteId(null);
            }}
            className="rounded-full bg-error px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
