use rusqlite::{params, Connection};
use tauri::State;
use uuid::Uuid;

use crate::db;
use crate::models::{Movie, MovieInput, MovieWithRatings, Rating};
use crate::AppState;

pub fn fetch_all(conn: &Connection) -> rusqlite::Result<Vec<MovieWithRatings>> {
    let movies = db::fetch_movies(conn)?;
    let ratings = db::fetch_ratings(conn)?;

    Ok(movies
        .into_iter()
        .map(|movie| {
            let rs: Vec<Rating> = ratings
                .iter()
                .filter(|r| r.movie_id == movie.id)
                .cloned()
                .collect();
            MovieWithRatings {
                movie,
                ratings: rs,
            }
        })
        .collect())
}

fn movie_by_id(conn: &Connection, id: &str) -> rusqlite::Result<Movie> {
    conn.query_row(
        "SELECT id, title, year, genre, added_date, poster_url, notes, watched_at, watched
         FROM movies WHERE id = ?1",
        params![id],
        |row| {
            Ok(Movie {
                id: row.get("id")?,
                title: row.get("title")?,
                year: row.get("year")?,
                genre: row.get("genre")?,
                added_date: row.get("added_date")?,
                poster_url: row.get("poster_url")?,
                notes: row.get("notes")?,
                watched_at: row.get("watched_at")?,
                watched: row.get::<_, i64>("watched")? != 0,
            })
        },
    )
}

#[tauri::command]
pub fn get_movies(state: State<AppState>) -> Result<Vec<MovieWithRatings>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    fetch_all(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_movie(
    state: State<AppState>,
    input: MovieInput,
) -> Result<MovieWithRatings, String> {
    let title = input.title.trim();
    if title.is_empty() {
        return Err("El título es obligatorio".into());
    }

    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let watched = if input.watched { 1 } else { 0 };
    conn.execute(
        "INSERT INTO movies (id, title, year, genre, poster_url, notes, watched_at, added_date, watched)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, COALESCE(?8, CURRENT_TIMESTAMP), ?9)",
        params![
            id,
            title,
            input.year,
            input.genre,
            input.poster_url,
            input.notes,
            input.watched_at,
            input.added_date,
            watched
        ],
    )
    .map_err(|e| e.to_string())?;

    let movie = movie_by_id(&conn, &id).map_err(|e| e.to_string())?;
    Ok(MovieWithRatings {
        movie,
        ratings: vec![],
    })
}

#[tauri::command]
pub fn update_movie(
    state: State<AppState>,
    id: String,
    input: MovieInput,
) -> Result<MovieWithRatings, String> {
    let title = input.title.trim();
    if title.is_empty() {
        return Err("El título es obligatorio".into());
    }

    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let watched = if input.watched { 1 } else { 0 };
    conn.execute(
        "UPDATE movies SET title = ?1, year = ?2, genre = ?3, poster_url = ?4, notes = ?5,
         watched_at = ?6, added_date = COALESCE(?7, added_date), watched = ?8
         WHERE id = ?9",
        params![
            title,
            input.year,
            input.genre,
            input.poster_url,
            input.notes,
            input.watched_at,
            input.added_date,
            watched,
            id
        ],
    )
    .map_err(|e| e.to_string())?;

    let movie = movie_by_id(&conn, &id).map_err(|e| e.to_string())?;
    let ratings = db::fetch_ratings(&conn)
        .map_err(|e| e.to_string())?
        .into_iter()
        .filter(|r| r.movie_id == id)
        .collect();
    Ok(MovieWithRatings { movie, ratings })
}

#[tauri::command]
pub fn delete_movie(state: State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM movies WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
