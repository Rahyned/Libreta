import { motion } from "framer-motion";
import { Clapperboard, Home, Pencil, Star, Trash2 } from "lucide-react";
import { formatDate, parseMood } from "../lib/constants";
import type { Movie, Rating, User } from "../types";
import Stars from "./Stars";

interface Props {
  movie: Movie;
  ratings: Rating[];
  users: User[];
  onRate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ratingFor(ratings: Rating[], userId: string): Rating | undefined {
  return ratings.find((r) => r.user_id === userId);
}

export default function MovieCard({
  movie,
  ratings,
  users,
  onRate,
  onEdit,
  onDelete,
}: Props) {
  const initial = (movie.title.trim().charAt(0) || "?").toUpperCase();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -3 }}
      className="paper-card group relative flex flex-col overflow-hidden"
    >
      <div className="flex gap-4 p-4">
        {/* Poster / placeholder */}
        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-gradient-to-br from-pink/40 to-blue/40">
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
            <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-ink/60">
              {initial}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold leading-snug text-ink">
            {movie.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {movie.year && (
              <span className="text-xs font-medium text-ink-soft">
                {movie.year}
              </span>
            )}
            {movie.genre && (
              <span className="rounded-full bg-peach px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                {movie.genre}
              </span>
            )}
            {movie.watched_at && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue/25 px-2 py-0.5 text-[11px] font-medium text-ink">
                {movie.watched_at === "En el Cine" ? (
                  <Clapperboard size={11} />
                ) : (
                  <Home size={11} />
                )}
                {movie.watched_at}
              </span>
            )}
            <span className="text-[11px] text-ink-soft/60">
              {formatDate(movie.added_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div className="dashed-rule mx-4" />
      <div className="flex-1 space-y-2 p-4 pt-3">
        {users.map((user) => {
          const r = ratingFor(ratings, user.id);
          const mood = parseMood(r?.mood ?? null);
          return (
            <div key={user.id} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <span className="w-16 shrink-0 truncate text-xs font-medium text-ink-soft">
                {user.name}
              </span>
              {r ? (
                <span className="flex items-center gap-1.5">
                  <Stars value={r.rating} />
                  {mood && (
                    <span
                      className="text-sm leading-none"
                      title={mood.label}
                    >
                      {mood.emoji}
                    </span>
                  )}
                </span>
              ) : (
                <button
                  onClick={onRate}
                  className="text-xs text-ink-soft/60 transition hover:text-pink-deep"
                >
                  sin calificar
                </button>
              )}
            </div>
          );
        })}

        {movie.notes && (
          <p className="font-handwritten text-lg leading-tight text-ink">
            “{movie.notes}”
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-line/70 bg-paper/40 px-4 py-2">
        <button
          onClick={onRate}
          className="inline-flex items-center gap-1.5 rounded-full bg-pink px-3 py-1 text-xs font-semibold text-ink transition hover:bg-pink-deep"
        >
          <Star size={13} className="fill-current" />
          Calificar
        </button>
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="rounded-full p-1.5 text-ink-soft transition hover:bg-line/60 hover:text-ink"
            aria-label="Editar"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            className="rounded-full p-1.5 text-ink-soft transition hover:bg-error/20 hover:text-error"
            aria-label="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
