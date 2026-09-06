use rusqlite::{params, Connection};
use tauri::State;
use uuid::Uuid;

use crate::db;
use crate::models::{Movie, MovieInput, MovieWithRatings, Rating};
use crate::AppState;

fn validate_year(year: Option<i32>) -> Result<(), String> {
    if let Some(y) = year {
        if !(1888..=3000).contains(&y) {
            return Err(format!(
                "El año debe estar entre 1888 y 3000 (se recibió {y})"
            ));
        }
    }
    Ok(())
}

fn validate_kind(kind: &str) -> Result<(), String> {
    if !matches!(kind, "movie" | "series") {
        return Err(format!("Tipo inválido: {kind}"));
    }
    Ok(())
}

fn validate_seasons(seasons: Option<i64>) -> Result<(), String> {
    if let Some(s) = seasons {
        if s < 1 {
            return Err("Las temporadas deben ser al menos 1".into());
        }
    }
    Ok(())
}

fn validate_status(status: Option<&str>) -> Result<(), String> {
    if let Some(s) = status {
        if !matches!(s, "Completada" | "En curso" | "Pausada") {
            return Err(format!("Estado inválido: {s}"));
        }
    }
    Ok(())
}

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
        "SELECT id, title, year, genre, added_date, poster_url, notes, watched_at, watched,
                kind, seasons, status
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
                kind: row.get("kind")?,
                seasons: row.get("seasons")?,
                status: row.get("status")?,
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
    validate_year(input.year)?;
    let kind = input.kind.as_deref().unwrap_or("movie").to_string();
    validate_kind(&kind)?;
    validate_seasons(input.seasons)?;
    validate_status(input.status.as_deref())?;

    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let watched = if input.watched { 1 } else { 0 };
    conn.execute(
        "INSERT INTO movies (id, title, year, genre, poster_url, notes, watched_at, added_date, watched, kind, seasons, status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, COALESCE(?8, CURRENT_TIMESTAMP), ?9, ?10, ?11, ?12)",
        params![
            id,
            title,
            input.year,
            input.genre,
            input.poster_url,
            input.notes,
            input.watched_at,
            input.added_date,
            watched,
            kind,
            input.seasons,
            input.status,
        ],
    )
    .map_err(|e| e.to_string())?;

    let movie = movie_by_id(&conn, &id).map_err(|e| e.to_string())?;
    log::info!("Película agregada: {:?} ({:?})", movie.title, movie.year);
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
    validate_year(input.year)?;
    let kind = input.kind.as_deref().unwrap_or("movie").to_string();
    validate_kind(&kind)?;
    validate_seasons(input.seasons)?;
    validate_status(input.status.as_deref())?;

    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let watched = if input.watched { 1 } else { 0 };
    conn.execute(
        "UPDATE movies SET title = ?1, year = ?2, genre = ?3, poster_url = ?4, notes = ?5,
         watched_at = ?6, added_date = COALESCE(?7, added_date), watched = ?8, kind = ?9,
         seasons = ?10, status = ?11
         WHERE id = ?12",
        params![
            title,
            input.year,
            input.genre,
            input.poster_url,
            input.notes,
            input.watched_at,
            input.added_date,
            watched,
            kind,
            input.seasons,
            input.status,
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
    log::info!("Película actualizada: {:?} ({:?})", movie.title, movie.year);
    Ok(MovieWithRatings { movie, ratings })
}

#[tauri::command]
pub fn delete_movie(state: State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM movies WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    log::info!("Película eliminada: {id}");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{validate_kind, validate_seasons, validate_status, validate_year};

    #[test]
    fn year_range_is_valid() {
        assert_eq!(validate_year(None), Ok(()));
        assert_eq!(validate_year(Some(1888)), Ok(()));
        assert_eq!(validate_year(Some(2023)), Ok(()));
        assert_eq!(validate_year(Some(3000)), Ok(()));
    }

    #[test]
    fn out_of_range_years_are_rejected() {
        assert!(validate_year(Some(1887)).is_err());
        assert!(validate_year(Some(3001)).is_err());
    }

    #[test]
    fn kind_validation_accepts_movie_and_series() {
        assert_eq!(validate_kind("movie"), Ok(()));
        assert_eq!(validate_kind("series"), Ok(()));
        assert!(validate_kind("episode").is_err());
        assert!(validate_kind("").is_err());
    }

    #[test]
    fn seasons_validation() {
        assert_eq!(validate_seasons(None), Ok(()));
        assert_eq!(validate_seasons(Some(1)), Ok(()));
        assert_eq!(validate_seasons(Some(12)), Ok(()));
        assert!(validate_seasons(Some(0)).is_err());
    }

    #[test]
    fn status_validation() {
        assert_eq!(validate_status(None), Ok(()));
        assert_eq!(validate_status(Some("Completada")), Ok(()));
        assert_eq!(validate_status(Some("En curso")), Ok(()));
        assert_eq!(validate_status(Some("Pausada")), Ok(()));
        assert!(validate_status(Some("Cancelada")).is_err());
    }
}
