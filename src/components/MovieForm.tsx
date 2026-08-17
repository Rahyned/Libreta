import { useEffect, useRef, useState } from "react";
import { Clapperboard, Home } from "lucide-react";
import { api } from "../lib/api";
import { GENRES, WATCHED_AT_OPTIONS } from "../lib/constants";
import type { Movie, MovieInput } from "../types";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: MovieInput) => void;
  initial?: Movie | null;
}

type PosterStatus = "idle" | "searching" | "found" | "notfound";

const today = () => new Date().toISOString().slice(0, 10);

export default function MovieForm({ open, onClose, onSubmit, initial }: Props) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [watchedAt, setWatchedAt] = useState<string>("");
  const [date, setDate] = useState(today);
  const [error, setError] = useState<string | null>(null);
  const [posterStatus, setPosterStatus] = useState<PosterStatus>("idle");
  const [posterTitle, setPosterTitle] = useState<string | null>(null);

  const searchToken = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setYear(initial?.year ? String(initial.year) : "");
      setGenre(initial?.genre ?? "");
      setPosterUrl(initial?.poster_url ?? "");
      setNotes(initial?.notes ?? "");
      setWatchedAt(initial?.watched_at ?? "");
      setDate(initial?.added_date ? initial.added_date.slice(0, 10) : today());
      setError(null);
      setPosterStatus("idle");
      setPosterTitle(null);
      searchToken.current += 1;
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const q = title.trim();
    if (q.length < 3) {
      setPosterStatus("idle");
      setPosterTitle(null);
      return;
    }

    const token = ++searchToken.current;
    setPosterStatus("searching");
    setPosterTitle(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const y = Number(year);
      const parsedYear = year.trim() && !Number.isNaN(y) ? y : null;
      const result = await api.searchMovie(q, parsedYear);
      if (token !== searchToken.current) return;
      if (result) {
        if (result.year) setYear(String(result.year));
        if (result.genres.length > 0) setGenre(result.genres[0]);
        if (result.poster_url) setPosterUrl(result.poster_url);
        setPosterTitle(result.title);
        setPosterStatus("found");
      } else {
        setPosterStatus("notfound");
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, year, open]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    const parsedYear = year.trim() ? Number(year) : null;
    if (
      year.trim() &&
      (Number.isNaN(parsedYear) || (parsedYear as number) < 1888)
    ) {
      setError("El año no es válido.");
      return;
    }
    onSubmit({
      title: title.trim(),
      year: parsedYear,
      genre: genre.trim() || null,
      poster_url: posterUrl.trim() || null,
      notes: notes.trim() || null,
      watched_at: watchedAt || null,
      added_date: date || today(),
    });
  };

  const inputClass =
    "w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-pink";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Editar película" : "Agregar película"}
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">
            Título <span className="text-error">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Ej. Oppenheimer"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">
              Año de estreno
            </label>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={inputClass}
              placeholder="2023"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">
              Género
            </label>
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={inputClass}
              list="genres-list"
              placeholder="Drama, Comedia…"
            />
            <datalist id="genres-list">
              {GENRES.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">
            ¿Dónde la vimos?
          </label>
          <div className="flex gap-2">
            {WATCHED_AT_OPTIONS.map((opt) => {
              const active = watchedAt === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setWatchedAt(active ? "" : opt)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "border-pink bg-pink/20 text-ink"
                      : "border-line text-ink-soft hover:bg-line/40"
                  }`}
                >
                  {opt === "En Casa" ? (
                    <Home size={15} />
                  ) : (
                    <Clapperboard size={15} />
                  )}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">
            Fecha en que la agregaron
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">
            Póster
          </label>
          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <input
                value={posterUrl}
                onChange={(e) => {
                  setPosterUrl(e.target.value);
                  setPosterStatus("idle");
                  setPosterTitle(null);
                }}
                className={inputClass}
                placeholder="https://… (se autocompleta mientras escribes)"
              />
              {posterStatus === "searching" && (
                <p className="mt-1 text-xs text-ink-soft">
                  Buscando "{title.trim()}"…
                </p>
              )}
              {posterStatus === "found" && (
                <p className="mt-1 text-xs text-success">
                  Póster encontrado{posterTitle ? `: ${posterTitle}` : ""}
                </p>
              )}
              {posterStatus === "notfound" && (
                <p className="mt-1 text-xs text-ink-soft">
                  No se encontró en TMDB ni Wikipedia. Pega la URL a mano.
                </p>
              )}
            </div>
            {posterUrl.trim() && (
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-line/30">
                <img
                  src={posterUrl}
                  alt="Póster"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} font-handwritten resize-none text-lg leading-tight`}
            placeholder="Notas en manuscrita…"
            rows={2}
          />
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-line/50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-full bg-pink px-5 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-pink-deep"
          >
            {initial ? "Guardar cambios" : "Agregar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}