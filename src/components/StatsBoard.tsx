import {
  Award,
  BarChart3,
  Clapperboard,
  HeartHandshake,
  Home,
} from "lucide-react";
import type { Stats } from "../types";
import Stars from "./Stars";

interface Props {
  stats: Stats;
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="paper-card flex items-center gap-3 p-4">
      <div className="rounded-full bg-blue/30 p-2 text-ink">{icon}</div>
      <div>
        <p className="text-xs font-medium text-ink-soft">{label}</p>
        <p className="font-display text-xl font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function StatsBoard({ stats }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<Clapperboard size={18} />}
          label="Películas"
          value={String(stats.totalMovies)}
        />
        <StatCard
          icon={<BarChart3 size={18} />}
          label="Calificaciones"
          value={String(stats.totalRatings)}
        />
        <StatCard
          icon={<Award size={18} />}
          label="Promedio general"
          value={stats.avgRating ? stats.avgRating.toFixed(1) : "—"}
        />
        <StatCard
          icon={<HeartHandshake size={18} />}
          label="Favorita juntos"
          value={stats.bestTogether ? "✨" : "—"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Distribution grid */}
        <div className="paper-card p-4">
          <h3 className="mb-3 font-display text-sm font-semibold text-ink">
            Cuántas de cada calificación
          </h3>

          {stats.distributionByUser.length === 0 || stats.totalRatings === 0 ? (
            <p className="text-xs text-ink-soft">
              Todavía no hay calificaciones.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr>
                    <th className="pb-1 text-left font-medium text-ink-soft">
                      Calif.
                    </th>
                    {stats.distributionByUser.map((u) => (
                      <th
                        key={u.userId}
                        className="pb-1 text-center font-semibold"
                      >
                        <div
                          className="mx-auto mb-0.5 h-2 w-2 rounded-full"
                          style={{ backgroundColor: u.color }}
                        />
                        <span className="text-ink">{u.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, (_, i) => {
                    const value = (i + 1) / 2;
                    const label =
                      value % 1 === 0 ? `${value}` : `${value.toFixed(1)}`;
                    const hasAny = stats.distributionByUser.some(
                      (u) => u.counts[i] > 0
                    );
                    if (!hasAny) return null;
                    return (
                      <tr key={i} className="border-t border-line/60">
                        <td className="py-1 pr-2 text-ink-soft">{label}★</td>
                        {stats.distributionByUser.map((u) => (
                          <td key={u.userId} className="py-1 text-center">
                            <span
                              className={`inline-block min-w-[18px] rounded-full px-1 ${
                                u.counts[i] > 0
                                  ? "bg-pink/20 font-semibold text-ink"
                                  : "text-ink-soft/30"
                              }`}
                            >
                              {u.counts[i] || "·"}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Per user */}
        <div className="paper-card p-4">
          <h3 className="mb-3 font-display text-sm font-semibold text-ink">
            Por persona
          </h3>
          <div className="space-y-3">
            {stats.perUser.map(({ user, avg, count }) => (
              <div key={user.id} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="flex-1 text-sm font-medium text-ink">
                  {user.name}
                </span>
                <span className="text-sm text-ink-soft">{count} films</span>
                <span className="w-9 text-right font-display font-semibold text-ink">
                  {avg ? avg.toFixed(1) : "—"}
                </span>
              </div>
            ))}
          </div>

          <div className="dashed-rule my-4" />

          <h3 className="mb-2 font-display text-sm font-semibold text-ink">
            Top de cada uno
          </h3>
          <div className="space-y-2">
            {stats.topMovieEach.map((t) => (
              <div key={t.userId} className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-ink-soft">
                  {t.movie?.title ?? "—"}
                </span>
                {t.rating !== null && <Stars value={t.rating} size={13} />}
              </div>
            ))}
          </div>
        </div>

        {/* Genres + years + location */}
        <div className="paper-card p-4">
          <h3 className="mb-3 font-display text-sm font-semibold text-ink">
            Por lugar
          </h3>
          {stats.perLocation.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {stats.perLocation.map((l) => (
                <span
                  key={l.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue/20 px-2.5 py-0.5 text-xs font-medium text-ink"
                >
                  {l.label === "En el Cine" ? (
                    <Clapperboard size={12} />
                  ) : l.label === "En Casa" ? (
                    <Home size={12} />
                  ) : null}
                  {l.label} · {l.count}
                </span>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-xs text-ink-soft">
              Todavía sin etiquetar lugar.
            </p>
          )}

          <h3 className="mb-3 font-display text-sm font-semibold text-ink">
            Por género
          </h3>
          <div className="space-y-2">
            {stats.perGenre.slice(0, 6).map((g) => (
              <div key={g.label} className="flex items-center gap-2">
                <span className="flex-1 truncate text-sm text-ink-soft">
                  {g.label}
                </span>
                <span className="rounded-full bg-blue/25 px-2 py-0.5 text-xs font-medium text-ink">
                  {g.count}
                </span>
              </div>
            ))}
          </div>

          {stats.perYear.length > 0 && (
            <>
              <div className="dashed-rule my-4" />
              <h3 className="mb-3 font-display text-sm font-semibold text-ink">
                Por año
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.perYear.map((y) => (
                  <span
                    key={y.label}
                    className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-medium text-ink-soft"
                  >
                    {y.label} · {y.count}
                  </span>
                ))}
              </div>
            </>
          )}

          {stats.bestTogether && (
            <>
              <div className="dashed-rule my-4" />
              <h3 className="mb-2 font-display text-sm font-semibold text-ink">
                Mejor película juntos
              </h3>
              <p className="text-sm font-medium text-ink">
                {stats.bestTogether.title}
              </p>
              <p className="text-xs text-ink-soft">
                Ambos le dieron 4+ estrellas
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
