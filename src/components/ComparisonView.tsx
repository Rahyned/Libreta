import { motion } from "framer-motion";
import { Clapperboard, Heart, Home, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { formatDate } from "../lib/constants";
import type { MovieWithRatings, User } from "../types";
import Stars from "./Stars";

interface Props {
  movies: MovieWithRatings[];
  users: User[];
  meId: string | null;
  partnerId: string | null;
}

function avg(ratings: { rating: number }[]): number {
  if (!ratings.length) return 0;
  return ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
}

export default function ComparisonView({
  movies,
  users,
  meId,
  partnerId,
}: Props) {
  const me = users.find((u) => u.id === meId) ?? users[0];
  const partner = users.find((u) => u.id === partnerId) ?? users[1];

  const rows = useMemo(() => {
    return movies
      .map(({ movie, ratings }) => {
        const my = ratings.find((r) => r.user_id === me?.id)?.rating ?? null;
        const theirs =
          ratings.find((r) => r.user_id === partner?.id)?.rating ?? null;
        return { movie, my, theirs };
      })
      .filter((r) => r.my !== null || r.theirs !== null);
  }, [movies, me, partner]);

  const myAvg = avg(rows.filter((r) => r.my !== null).map((r) => ({ rating: r.my! })));
  const theirAvg = avg(
    rows.filter((r) => r.theirs !== null).map((r) => ({ rating: r.theirs! }))
  );
  const combinedAvg = avg(
    rows.flatMap((r) =>
      [r.my, r.theirs].filter((v): v is number => v !== null).map((rating) => ({ rating }))
    )
  );

  const myTop = rows
    .filter((r) => r.my !== null)
    .reduce<(typeof rows)[number] | null>((a, b) => (b.my! > (a?.my ?? -1) ? b : a), null);
  const theirTop = rows
    .filter((r) => r.theirs !== null)
    .reduce<(typeof rows)[number] | null>(
      (a, b) => (b.theirs! > (a?.theirs ?? -1) ? b : a),
      null
    );

  if (!me || !partner) {
    return (
      <p className="rounded-card border border-dashed border-line bg-white/50 p-8 text-center text-ink-soft">
        Configura los dos usuarios en Ajustes para comparar.
      </p>
    );
  }

  const casaCount = movies.filter(
    (m) => m.movie.watched_at === "En Casa"
  ).length;
  const cineCount = movies.filter(
    (m) => m.movie.watched_at === "En el Cine"
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="paper-card p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: me.color }} />
            {me.name}
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            {myAvg ? myAvg.toFixed(1) : "—"}
          </p>
        </div>
        <div className="paper-card p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: partner.color }} />
            {partner.name}
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            {theirAvg ? theirAvg.toFixed(1) : "—"}
          </p>
        </div>
        <div className="paper-card col-span-2 flex items-center gap-3 p-4">
          <TrendingUp size={22} className="text-pink-deep" />
          <div>
            <p className="text-xs font-medium text-ink-soft">Promedio combinado</p>
            <p className="font-display text-2xl font-bold text-ink">
              {combinedAvg ? combinedAvg.toFixed(1) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Location summary */}
      {(casaCount > 0 || cineCount > 0) && (
        <div className="flex flex-wrap gap-2">
          {[
            { label: "En Casa", icon: <Home size={13} />, count: casaCount },
            {
              label: "En el Cine",
              icon: <Clapperboard size={13} />,
              count: cineCount,
            },
          ].map(({ label, icon, count }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue/20 px-3 py-1 text-xs font-medium text-ink"
            >
              {icon}
              {label} · {count}
            </span>
          ))}
        </div>
      )}

      {/* Best each */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { user: me, row: myTop, label: "Película favorita" },
          { user: partner, row: theirTop, label: "Película favorita" },
        ].map(({ user, row, label }) => (
          <div key={user.id} className="paper-card p-4">
            <p className="text-xs font-medium text-ink-soft">{label}</p>
            {row ? (
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-ink">
                    {row.movie.title}
                  </p>
                  {row.movie.year && (
                    <p className="text-xs text-ink-soft">{row.movie.year}</p>
                  )}
                </div>
                <Stars value={row.my !== null ? row.my : row.theirs!} size={16} />
              </div>
            ) : (
              <p className="mt-1 text-sm text-ink-soft">Sin calificaciones</p>
            )}
          </div>
        ))}
      </div>

      {/* Comparison list */}
      <div className="paper-card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-dashed border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          <span>Película</span>
          <span className="w-20 text-center" style={{ color: me.color }}>
            {me.name}
          </span>
          <span className="w-20 text-center" style={{ color: partner.color }}>
            {partner.name}
          </span>
        </div>

        <div className="divide-y divide-line/60">
          {rows.map(({ movie, my, theirs }) => {
            const diff = my !== null && theirs !== null ? Math.abs(my - theirs) : 0;
            const bigDiff = diff > 1;
            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 ${
                  bigDiff ? "bg-peach/40" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{movie.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <p className="shrink-0 text-xs text-ink-soft">
                      {[movie.year, movie.genre].filter(Boolean).join(" · ") || ""}
                    </p>
                    {movie.watched_at && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue/20 px-1.5 py-0.5 text-[10px] font-medium text-ink">
                        {movie.watched_at === "En el Cine" ? (
                          <Clapperboard size={10} />
                        ) : (
                          <Home size={10} />
                        )}
                        {movie.watched_at}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-soft/50">
                    agregada {formatDate(movie.added_date)}
                  </p>
                </div>
                <div className="flex w-20 flex-col items-center gap-1">
                  {my !== null ? <Stars value={my} /> : <span className="text-xs text-ink-soft/50">—</span>}
                  {my !== null && <span className="text-xs font-semibold text-ink">{my.toFixed(1)}</span>}
                </div>
                <div className="flex w-20 flex-col items-center gap-1">
                  {theirs !== null ? <Stars value={theirs} /> : <span className="text-xs text-ink-soft/50">—</span>}
                  {theirs !== null && (
                    <span className="text-xs font-semibold text-ink">{theirs.toFixed(1)}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {rows.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-soft">
            Aún no hay calificaciones para comparar.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-card border border-dashed border-line bg-white/50 px-4 py-3 text-sm text-ink-soft">
        <Heart size={16} className="text-pink-deep" />
        Las filas resaltadas indican diferencias de más de 1 estrella entre
        ustedes. ¡Esas son las mejores para debatir!
      </div>
    </div>
  );
}
