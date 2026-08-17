import { motion } from "framer-motion";
import { Star, StarHalf } from "lucide-react";
import { useEffect, useState } from "react";
import { MOODS, moodToString } from "../lib/constants";
import type { Movie, Rating, RatingInput, User } from "../types";
import Modal from "./Modal";

interface Props {
  open: boolean;
  movie: Movie;
  users: User[];
  ratings: Rating[];
  onSubmit: (input: RatingInput) => void;
  onClose: () => void;
}

export default function RatingSelector({
  open,
  movie,
  users,
  ratings,
  onSubmit,
  onClose,
}: Props) {
  const [userId, setUserId] = useState<string>(users[0]?.id ?? "");
  const [rating, setRating] = useState<number>(0);
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [hovered, setHovered] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setUserId(users[0]?.id ?? "");
    }
  }, [open, users]);

  useEffect(() => {
    const existing = ratings.find((r) => r.user_id === userId);
    setRating(existing?.rating ?? 0);
    setMood(existing?.mood ?? null);
    setNote(existing?.personal_note ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, ratings, open]);

  const activeUser = users.find((u) => u.id === userId);
  const accent = activeUser?.color ?? "#d4a5a5";

  const handleSubmit = () => {
    if (!rating) return;
    onSubmit({
      movie_id: movie.id,
      user_id: userId,
      rating,
      mood,
      personal_note: note.trim() || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Calificar · ${movie.title}`}
      accent={accent}
    >
      {/* User switch */}
      {users.length > 1 && (
        <div className="mb-4 flex gap-2">
          {users.map((u) => {
            const active = userId === u.id;
            return (
              <button
                key={u.id}
                onClick={() => setUserId(u.id)}
                className={`flex-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "text-ink shadow-sm"
                    : "border-line text-ink-soft hover:bg-line/40"
                }`}
                style={active ? { backgroundColor: u.color } : undefined}
              >
                <span
                  className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle"
                  style={{ backgroundColor: active ? undefined : u.color }}
                />
                {u.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Stars */}
      <div className="mb-4 flex items-center justify-center gap-1 py-2">
        {[1, 2, 3, 4, 5].map((i) => {
          const shown = hovered || rating;
          const full = shown >= i;
          const half = shown >= i - 0.5;
          return (
            <motion.button
              key={i}
              type="button"
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHovered(
                  e.clientX < rect.left + rect.width / 2 ? i - 0.5 : i
                );
              }}
              onMouseLeave={() => setHovered(0)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setRating(
                  e.clientX < rect.left + rect.width / 2 ? i - 0.5 : i
                );
              }}
              className="p-0.5"
              aria-label={`${i} ${i > 1 ? "estrellas" : "estrella"} o media`}
            >
              {full ? (
                <Star size={34} className="fill-[#e3b169] text-[#e3b169]" />
              ) : half ? (
                <StarHalf
                  size={34}
                  className="fill-[#e3b169] text-[#e3b169]"
                />
              ) : (
                <Star size={34} className="text-line" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Mood */}
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
        ¿Qué te pareció?
      </p>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {MOODS.map((m) => {
          const value = moodToString(m);
          const active = mood === value;
          return (
            <motion.button
              key={value}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => setMood(active ? null : value)}
              className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2 text-center transition ${
                active
                  ? "border-pink bg-pink/20"
                  : "border-line hover:bg-line/40"
              }`}
            >
              <span className="text-xl leading-none">{m.emoji}</span>
              <span className="text-[11px] font-medium text-ink-soft">
                {m.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Note */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={`Nota personal de ${activeUser?.name ?? ""}…`}
        className="font-handwritten w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-lg leading-tight text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-pink"
        rows={2}
      />

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-line/50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!rating}
          className="rounded-full px-5 py-2 text-sm font-semibold text-ink shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: accent }}
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}
