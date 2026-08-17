use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Movie {
    pub id: String,
    pub title: String,
    pub year: Option<i32>,
    pub genre: Option<String>,
    pub added_date: String,
    pub poster_url: Option<String>,
    pub notes: Option<String>,
    pub watched_at: Option<String>,
    pub watched: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rating {
    pub id: String,
    pub movie_id: String,
    pub user_id: String,
    pub rating: f64,
    pub mood: Option<String>,
    pub personal_note: Option<String>,
    pub rated_date: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MovieWithRatings {
    pub movie: Movie,
    pub ratings: Vec<Rating>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct MovieInput {
    pub title: String,
    pub year: Option<i32>,
    pub genre: Option<String>,
    pub poster_url: Option<String>,
    pub notes: Option<String>,
    pub watched_at: Option<String>,
    pub added_date: Option<String>,
    pub watched: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct RatingInput {
    pub movie_id: String,
    pub user_id: String,
    pub rating: f64,
    pub mood: Option<String>,
    pub personal_note: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserStat {
    pub user_id: String,
    pub name: String,
    pub avg: f64,
    pub count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CountStat {
    pub label: String,
    pub count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YearStat {
    pub year: i32,
    pub count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TopMovie {
    pub user_id: String,
    pub title: String,
    pub rating: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stats {
    pub avg_rating: f64,
    pub total_movies: i64,
    pub total_ratings: i64,
    pub distribution: Vec<i64>,
    pub per_user: Vec<UserStat>,
    pub per_genre: Vec<CountStat>,
    pub per_year: Vec<YearStat>,
    pub top_movie_each: Vec<TopMovie>,
    pub best_together: Option<Movie>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MovieSearchResult {
    pub title: String,
    pub year: Option<i32>,
    pub genres: Vec<String>,
    pub poster_url: String,
    pub source: String,
}
