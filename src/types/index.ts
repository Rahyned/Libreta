export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number | null;
  genre: string | null;
  added_date: string;
  poster_url: string | null;
  notes: string | null;
  watched_at: string | null;
  watched: boolean;
}

export interface Rating {
  id: string;
  movie_id: string;
  user_id: string;
  rating: number;
  mood: string | null;
  personal_note: string | null;
  rated_date: string;
}

export interface MovieWithRatings {
  movie: Movie;
  ratings: Rating[];
}

export interface MovieInput {
  title: string;
  year?: number | null;
  genre?: string | null;
  poster_url?: string | null;
  notes?: string | null;
  watched_at?: string | null;
  added_date?: string | null;
  watched?: boolean;
}

export interface RatingInput {
  movie_id: string;
  user_id: string;
  rating: number;
  mood?: string | null;
  personal_note?: string | null;
}

export interface PerUserStat {
  user: User;
  avg: number;
  count: number;
}

export interface CountStat {
  label: string;
  count: number;
}

export interface TopMovie {
  userId: string;
  movie: Movie | null;
  rating: number | null;
}

export interface Stats {
  avgRating: number;
  totalMovies: number;
  totalRatings: number;
  distribution: number[]; // index 0..9 => count for 0.5..5 stars
  distributionByUser: { userId: string; name: string; color: string; counts: number[] }[];
  perUser: PerUserStat[];
  perGenre: CountStat[];
  perYear: CountStat[];
  perLocation: CountStat[];
  topMovieEach: TopMovie[];
  bestTogether: Movie | null;
}

export interface MovieSearchResult {
  title: string;
  year: number | null;
  genres: string[];
  poster_url: string;
  source: string;
}
