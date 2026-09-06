use std::collections::HashMap;
use std::fs;

use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use serde_json::{json, Value};
use tauri::State;
use uuid::Uuid;

use crate::AppState;

const SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Serialize)]
pub struct BackupResult {
    pub users_imported: usize,
    pub movies_imported: usize,
    pub movies_merged: usize,
    pub ratings_imported: usize,
}

#[tauri::command]
pub fn export_backup(state: State<AppState>) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let users: Vec<Value> = {
        let mut stmt = conn
            .prepare("SELECT id, name, color FROM users ORDER BY rowid ASC")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok(json!({
                    "id": row.get::<_, String>("id")?,
                    "name": row.get::<_, String>("name")?,
                    "color": row.get::<_, String>("color")?,
                }))
            })
            .map_err(|e| e.to_string())?;
        rows.collect::<Result<_, _>>().map_err(|e| e.to_string())?
    };

    let movies: Vec<Value> = {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, year, genre, added_date, poster_url, notes, watched_at, watched,
                        kind, seasons, status
                 FROM movies ORDER BY added_date DESC, rowid DESC",
            )
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok(json!({
                    "id": row.get::<_, String>("id")?,
                    "title": row.get::<_, String>("title")?,
                    "year": row.get::<_, Option<i32>>("year")?,
                    "genre": row.get::<_, Option<String>>("genre")?,
                    "added_date": row.get::<_, String>("added_date")?,
                    "poster_url": row.get::<_, Option<String>>("poster_url")?,
                    "notes": row.get::<_, Option<String>>("notes")?,
                    "watched_at": row.get::<_, Option<String>>("watched_at")?,
                    "watched": row.get::<_, i64>("watched")? != 0,
                    "kind": row.get::<_, String>("kind")?,
                    "seasons": row.get::<_, Option<i64>>("seasons")?,
                    "status": row.get::<_, Option<String>>("status")?,
                }))
            })
            .map_err(|e| e.to_string())?;
        rows.collect::<Result<_, _>>().map_err(|e| e.to_string())?
    };

    let ratings: Vec<Value> = {
        let mut stmt = conn
            .prepare(
                "SELECT id, movie_id, user_id, rating, mood, personal_note, rated_date
                 FROM ratings",
            )
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok(json!({
                    "id": row.get::<_, String>("id")?,
                    "movie_id": row.get::<_, String>("movie_id")?,
                    "user_id": row.get::<_, String>("user_id")?,
                    "rating": row.get::<_, f64>("rating")?,
                    "mood": row.get::<_, Option<String>>("mood")?,
                    "personal_note": row.get::<_, Option<String>>("personal_note")?,
                    "rated_date": row.get::<_, String>("rated_date")?,
                }))
            })
            .map_err(|e| e.to_string())?;
        rows.collect::<Result<_, _>>().map_err(|e| e.to_string())?
    };

    Ok(json!({
        "app": "movie-libreta",
        "schemaVersion": SCHEMA_VERSION,
        "users": users,
        "movies": movies,
        "ratings": ratings,
    })
    .to_string())
}

#[tauri::command]
pub fn import_backup(state: State<AppState>, contents: String) -> Result<BackupResult, String> {
    let value: Value = serde_json::from_str(&contents)
        .map_err(|e| format!("El archivo no es un JSON válido: {e}"))?;

    let users = value
        .get("users")
        .and_then(Value::as_array)
        .ok_or("Falta la sección \"users\" en el respaldo")?;
    let movies = value
        .get("movies")
        .and_then(Value::as_array)
        .ok_or("Falta la sección \"movies\" en el respaldo")?;
    let ratings = value
        .get("ratings")
        .and_then(Value::as_array)
        .ok_or("Falta la sección \"ratings\" en el respaldo")?;

    let mut conn = state.db.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let mut users_imported = 0usize;
    for u in users {
        let Some(id) = u.get("id").and_then(Value::as_str) else {
            continue;
        };
        let name = u.get("name").and_then(Value::as_str).unwrap_or("Usuario");
        let color = u.get("color").and_then(Value::as_str).unwrap_or("#d4a5a5");
        let inserted = tx
            .execute(
                "INSERT OR IGNORE INTO users (id, name, color) VALUES (?1, ?2, ?3)",
                params![id, name, color],
            )
            .map_err(|e| e.to_string())?;
        users_imported += inserted as usize;
    }

    let mut movie_id_map: HashMap<String, String> = HashMap::new();
    let mut movies_imported = 0usize;
    let mut movies_merged = 0usize;

    for m in movies {
        let backup_id = m.get("id").and_then(Value::as_str).unwrap_or("");
        let title = m
            .get("title")
            .and_then(Value::as_str)
            .unwrap_or("")
            .trim()
            .to_string();
        if title.is_empty() {
            continue;
        }
        let year = m.get("year").and_then(Value::as_i64).map(|y| y as i32);
        let genre = m.get("genre").and_then(Value::as_str).map(String::from);
        let added_date = m
            .get("added_date")
            .and_then(Value::as_str)
            .map(String::from);
        let poster_url = m
            .get("poster_url")
            .and_then(Value::as_str)
            .map(String::from);
        let notes = m.get("notes").and_then(Value::as_str).map(String::from);
        let watched_at = m
            .get("watched_at")
            .and_then(Value::as_str)
            .map(String::from);
        let kind = m
            .get("kind")
            .and_then(Value::as_str)
            .unwrap_or("movie")
            .to_string();
        let seasons = m.get("seasons").and_then(Value::as_i64);
        let status = m.get("status").and_then(Value::as_str).map(String::from);
        let watched = match m.get("watched") {
            Some(Value::Bool(b)) => *b,
            Some(Value::Number(n)) => n.as_i64().map(|v| v != 0).unwrap_or(true),
            _ => true,
        };

        if !backup_id.is_empty()
            && exists_movie(&tx, backup_id).map_err(|e| e.to_string())?
        {
            movie_id_map.insert(backup_id.to_string(), backup_id.to_string());
            movies_merged += 1;
            continue;
        }

        if let Some(existing_id) =
            find_movie_by_title(&tx, &title, year, &kind).map_err(|e| e.to_string())?
        {
            movie_id_map.insert(backup_id.to_string(), existing_id);
            movies_merged += 1;
            continue;
        }

        let new_id = Uuid::new_v4().to_string();
        tx.execute(
            "INSERT INTO movies (id, title, year, genre, added_date, poster_url, notes, watched_at, watched, kind, seasons, status)
             VALUES (?1, ?2, ?3, ?4, COALESCE(?5, CURRENT_TIMESTAMP), ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![
                new_id,
                title,
                year,
                genre,
                added_date,
                poster_url,
                notes,
                watched_at,
                if watched { 1 } else { 0 },
                kind,
                seasons,
                status,
            ],
        )
        .map_err(|e| e.to_string())?;
        movie_id_map.insert(backup_id.to_string(), new_id);
        movies_imported += 1;
    }

    let mut ratings_imported = 0usize;
    for r in ratings {
        let Some(backup_movie_id) = r.get("movie_id").and_then(Value::as_str) else {
            continue;
        };
        let Some(local_movie_id) = movie_id_map.get(backup_movie_id) else {
            continue;
        };
        let Some(user_id) = r.get("user_id").and_then(Value::as_str) else {
            continue;
        };
        if !exists_user(&tx, user_id).map_err(|e| e.to_string())? {
            continue;
        }
        let rating = match r.get("rating").and_then(Value::as_f64) {
            Some(v) => v.clamp(1.0, 5.0),
            None => continue,
        };
        let mood = r.get("mood").and_then(Value::as_str).map(String::from);
        let personal_note = r
            .get("personal_note")
            .and_then(Value::as_str)
            .map(String::from);
        let rated_date = r
            .get("rated_date")
            .and_then(Value::as_str)
            .map(String::from);
        let id = Uuid::new_v4().to_string();

        let inserted = tx
            .execute(
                "INSERT OR IGNORE INTO ratings (id, movie_id, user_id, rating, mood, personal_note, rated_date)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, COALESCE(?7, CURRENT_TIMESTAMP))",
                params![id, local_movie_id, user_id, rating, mood, personal_note, rated_date],
            )
            .map_err(|e| e.to_string())?;
        ratings_imported += inserted as usize;
    }

    tx.commit().map_err(|e| e.to_string())?;

    log::info!(
        "Respaldo importado: {} usuarios, {} películas nuevas, {} fusionadas, {} valoraciones",
        users_imported,
        movies_imported,
        movies_merged,
        ratings_imported
    );

    Ok(BackupResult {
        users_imported,
        movies_imported,
        movies_merged,
        ratings_imported,
    })
}

fn exists_query(conn: &Connection, sql: &str, id: &str) -> rusqlite::Result<bool> {
    Ok(conn
        .query_row(sql, params![id], |_| Ok(()))
        .optional()?
        .is_some())
}

fn exists_movie(conn: &Connection, id: &str) -> rusqlite::Result<bool> {
    exists_query(conn, "SELECT 1 FROM movies WHERE id = ?1", id)
}

fn exists_user(conn: &Connection, id: &str) -> rusqlite::Result<bool> {
    exists_query(conn, "SELECT 1 FROM users WHERE id = ?1", id)
}

fn find_movie_by_title(
    conn: &Connection,
    title: &str,
    year: Option<i32>,
    kind: &str,
) -> rusqlite::Result<Option<String>> {
    Ok(conn
        .query_row(
            "SELECT id FROM movies WHERE title = ?1 COLLATE NOCASE AND year IS ?2 AND kind = ?3 LIMIT 1",
            params![title, year, kind],
            |row| row.get(0),
        )
        .optional()?)
}

#[tauri::command]
pub fn write_backup_file(path: String, contents: String) -> Result<(), String> {
    fs::write(&path, contents).map_err(|e| format!("No se pudo guardar el archivo: {e}"))?;
    log::info!("Respaldo guardado en {path}");
    Ok(())
}

#[tauri::command]
pub fn read_backup_file(path: String) -> Result<String, String> {
    let contents = fs::read_to_string(&path)
        .map_err(|e| format!("No se pudo leer el archivo: {e}"))?;
    log::info!("Respaldo leído desde {path}");
    Ok(contents)
}

#[cfg(test)]
mod tests {
    use super::{read_backup_file, write_backup_file};

    #[test]
    fn write_and_read_roundtrip() {
        let path = std::env::temp_dir()
            .join(format!("libreta-backup-{}.json", std::process::id()));
        write_backup_file(path.to_string_lossy().into(), r#"{"app":"movie-libreta"}"#.into())
            .expect("write ok");
        let contents = read_backup_file(path.to_string_lossy().into()).expect("read ok");
        assert_eq!(contents, r#"{"app":"movie-libreta"}"#);
        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn read_missing_file_returns_error() {
        let path = std::env::temp_dir().join("libreta-no-existe.json");
        assert!(read_backup_file(path.to_string_lossy().into()).is_err());
    }
}