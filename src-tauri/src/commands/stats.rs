use std::collections::HashMap;

use tauri::State;

use crate::commands::movies;
use crate::db;
use crate::models::{CountStat, Movie, MovieWithRatings, Stats, TopMovie, UserStat, YearStat};
use crate::AppState;

#[tauri::command]
pub fn compare_ratings(state: State<AppState>) -> Result<Vec<MovieWithRatings>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    movies::fetch_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_stats(state: State<AppState>) -> Result<Stats, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let users = db::fetch_users(&conn).map_err(|e| e.to_string())?;
    let movies = db::fetch_movies(&conn).map_err(|e| e.to_string())?;
    let ratings = db::fetch_ratings(&conn).map_err(|e| e.to_string())?;

    let total_movies = movies.len() as i64;
    let total_ratings = ratings.len() as i64;
    let avg_rating = if total_ratings > 0 {
        ratings.iter().map(|r| r.rating).sum::<f64>() / total_ratings as f64
    } else {
        0.0
    };

    let mut distribution = vec![0i64; 5];
    for r in &ratings {
        let b = (r.rating.round() as i64 - 1).clamp(0, 4) as usize;
        distribution[b] += 1;
    }

    let per_user: Vec<UserStat> = users
        .iter()
        .map(|u| {
            let rs: Vec<_> = ratings.iter().filter(|r| r.user_id == u.id).collect();
            let count = rs.len() as i64;
            let avg = if count > 0 {
                rs.iter().map(|r| r.rating).sum::<f64>() / count as f64
            } else {
                0.0
            };
            UserStat {
                user_id: u.id.clone(),
                name: u.name.clone(),
                avg,
                count,
            }
        })
        .collect();

    let mut genre_map: HashMap<String, i64> = HashMap::new();
    for m in &movies {
        let g = m
            .genre
            .clone()
            .map(|g| g.trim().to_string())
            .filter(|g| !g.is_empty())
            .unwrap_or_else(|| "Sin género".into());
        *genre_map.entry(g).or_insert(0) += 1;
    }
    let mut per_genre: Vec<CountStat> = genre_map
        .into_iter()
        .map(|(label, count)| CountStat { label, count })
        .collect();
    per_genre.sort_by(|a, b| b.count.cmp(&a.count));

    let mut year_map: HashMap<i32, i64> = HashMap::new();
    for m in &movies {
        if let Some(y) = m.year {
            *year_map.entry(y).or_insert(0) += 1;
        }
    }
    let mut per_year: Vec<YearStat> = year_map
        .into_iter()
        .map(|(year, count)| YearStat { year, count })
        .collect();
    per_year.sort_by_key(|y| y.year);

    let top_movie_each: Vec<TopMovie> = users
        .iter()
        .filter_map(|u| {
            let rs: Vec<_> = ratings.iter().filter(|r| r.user_id == u.id).collect();
            let best = rs
                .iter()
                .max_by(|a, b| a.rating.partial_cmp(&b.rating).unwrap_or(std::cmp::Ordering::Equal))?;
            let title = movies
                .iter()
                .find(|m| m.id == best.movie_id)
                .map(|m| m.title.clone())
                .unwrap_or_default();
            Some(TopMovie {
                user_id: u.id.clone(),
                title,
                rating: best.rating,
            })
        })
        .collect();

    let best_together: Option<Movie> = {
        let mut best: Option<(&Movie, f64)> = None;
        for m in &movies {
            let rs: Vec<_> = ratings.iter().filter(|r| r.movie_id == m.id).collect();
            if rs.len() < 2 {
                continue;
            }
            let min = rs.iter().map(|r| r.rating).fold(f64::INFINITY, f64::min);
            if min >= 4.0 {
                let combined: f64 = rs.iter().map(|r| r.rating).sum();
                if best.map_or(true, |(_, s)| combined > s) {
                    best = Some((m, combined));
                }
            }
        }
        best.map(|(m, _)| m.clone())
    };

    Ok(Stats {
        avg_rating,
        total_movies,
        total_ratings,
        distribution,
        per_user,
        per_genre,
        per_year,
        top_movie_each,
        best_together,
    })
}
