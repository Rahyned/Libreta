use rusqlite::{params, Connection};
use tauri::State;
use uuid::Uuid;

use crate::db;
use crate::models::{Rating, RatingInput};
use crate::AppState;

fn rating_by_id(conn: &Connection, id: &str) -> rusqlite::Result<Rating> {
    conn.query_row(
        "SELECT id, movie_id, user_id, rating, mood, personal_note, rated_date
         FROM ratings WHERE id = ?1",
        params![id],
        |row| {
            Ok(Rating {
                id: row.get("id")?,
                movie_id: row.get("movie_id")?,
                user_id: row.get("user_id")?,
                rating: row.get("rating")?,
                mood: row.get("mood")?,
                personal_note: row.get("personal_note")?,
                rated_date: row.get("rated_date")?,
            })
        },
    )
}

#[tauri::command]
pub fn get_ratings(state: State<AppState>) -> Result<Vec<Rating>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    db::fetch_ratings(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_rating(state: State<AppState>, input: RatingInput) -> Result<Rating, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let rating = input.rating.clamp(1.0, 5.0);

    let existing: rusqlite::Result<String> = conn.query_row(
        "SELECT id FROM ratings WHERE movie_id = ?1 AND user_id = ?2",
        params![input.movie_id, input.user_id],
        |row| row.get(0),
    );

    let result: Result<Rating, String> = match existing {
        Ok(id) => {
            conn.execute(
                "UPDATE ratings SET rating = ?1, mood = ?2, personal_note = ?3,
                 rated_date = CURRENT_TIMESTAMP WHERE id = ?4",
                params![rating, input.mood, input.personal_note, id],
            )
            .map_err(|e| e.to_string())?;
            rating_by_id(&conn, &id).map_err(|e| e.to_string())
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            let id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO ratings (id, movie_id, user_id, rating, mood, personal_note)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    id,
                    input.movie_id,
                    input.user_id,
                    rating,
                    input.mood,
                    input.personal_note
                ],
            )
            .map_err(|e| e.to_string())?;
            rating_by_id(&conn, &id).map_err(|e| e.to_string())
        }
        Err(e) => Err(e.to_string()),
    };

    match &result {
        Ok(r) => log::info!(
            "Valoración guardada: usuario {} película {} = {}",
            r.user_id,
            r.movie_id,
            r.rating
        ),
        Err(e) => log::error!("Error al guardar valoración: {e}"),
    }
    result
}
