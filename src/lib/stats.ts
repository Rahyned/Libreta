import type { MovieWithRatings, Stats, User } from "../types";

export function computeStats(
  movies: MovieWithRatings[],
  users: User[]
): Stats {
  const ratings = movies.flatMap((m) => m.ratings);
  const totalRatings = ratings.length;
  const avgRating = totalRatings
    ? ratings.reduce((s, r) => s + r.rating, 0) / totalRatings
    : 0;

  const distribution = [0, 0, 0, 0, 0];
  for (const r of ratings) {
    const bucket = Math.min(4, Math.max(0, Math.round(r.rating) - 1));
    distribution[bucket]++;
  }

  const perUser = users.map((user) => {
    const rs = ratings.filter((r) => r.user_id === user.id);
    const count = rs.length;
    const avg = count ? rs.reduce((s, r) => s + r.rating, 0) / count : 0;
    return { user, avg, count };
  });

  const genreMap = new Map<string, number>();
  for (const m of movies) {
    const g = m.movie.genre?.trim() || "Sin género";
    genreMap.set(g, (genreMap.get(g) ?? 0) + 1);
  }
  const perGenre = [...genreMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const yearMap = new Map<number, number>();
  for (const m of movies) {
    if (m.movie.year) {
      yearMap.set(m.movie.year, (yearMap.get(m.movie.year) ?? 0) + 1);
    }
  }
  const perYear = [...yearMap.entries()]
    .map(([year, count]) => ({ label: String(year), count }))
    .sort((a, b) => Number(a.label) - Number(b.label));

  const locationMap = new Map<string, number>();
  for (const m of movies) {
    const l = m.movie.watched_at?.trim() || "Sin definir";
    locationMap.set(l, (locationMap.get(l) ?? 0) + 1);
  }
  const perLocation = [...locationMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const topMovieEach = users.map((user) => {
    const rs = ratings.filter((r) => r.user_id === user.id);
    if (!rs.length) return { userId: user.id, movie: null, rating: null };
    const top = rs.reduce((a, b) => (b.rating > a.rating ? b : a));
    const movie =
      movies.find((m) => m.movie.id === top.movie_id)?.movie ?? null;
    return { userId: user.id, movie, rating: top.rating };
  });

  let bestTogether: MovieWithRatings["movie"] | null = null;
  let bestScore = -1;
  for (const m of movies) {
    if (m.ratings.length < 2) continue;
    const min = Math.min(...m.ratings.map((r) => r.rating));
    if (min >= 4) {
      const combined = m.ratings.reduce((s, r) => s + r.rating, 0);
      if (combined > bestScore) {
        bestScore = combined;
        bestTogether = m.movie;
      }
    }
  }

  return {
    avgRating,
    totalMovies: movies.length,
    totalRatings,
    distribution,
    perUser,
    perGenre,
    perYear,
    perLocation,
    topMovieEach,
    bestTogether,
  };
}
