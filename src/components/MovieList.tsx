import { AnimatePresence } from "framer-motion";
import { Film } from "lucide-react";
import type { Movie, MovieWithRatings, User } from "../types";
import MovieCard from "./MovieCard";

interface Props {
  movies: MovieWithRatings[];
  users: User[];
  onRate: (movie: Movie) => void;
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
}

export default function MovieList({
  movies,
  users,
  onRate,
  onEdit,
  onDelete,
}: Props) {
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface/50 py-16 text-center">
        <Film size={40} className="mb-3 text-line" />
        <p className="font-display font-semibold text-ink">
          Aún no hay nada por aquí
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Agrega la primera película o serie que hayan visto juntos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {movies.map(({ movie, ratings }) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            ratings={ratings}
            users={users}
            onRate={() => onRate(movie)}
            onEdit={() => onEdit(movie)}
            onDelete={() => onDelete(movie.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
