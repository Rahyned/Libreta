import { useEffect, useState } from "react";
import { Download, Save } from "lucide-react";
import ComparisonView from "../components/ComparisonView";
import { useMovieStore } from "../store/useMovieStore";

export default function Comparison() {
  const { movies, users, meId, partnerId, load } = useMovieStore();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">
          Comparación
        </h1>
        <p className="font-handwritten text-xl text-ink-soft">
          ¿a quién le gustó más?
        </p>
      </header>

      <ComparisonView
        movies={movies}
        users={users}
        meId={meId}
        partnerId={partnerId}
      />
    </div>
  );
}
