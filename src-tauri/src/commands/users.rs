use rusqlite::{params, Connection};
use tauri::State;

use crate::db;
use crate::models::User;
use crate::AppState;

fn user_by_id(conn: &Connection, id: &str) -> rusqlite::Result<User> {
    conn.query_row(
        "SELECT id, name, color FROM users WHERE id = ?1",
        params![id],
        |row| {
            Ok(User {
                id: row.get("id")?,
                name: row.get("name")?,
                color: row.get("color")?,
            })
        },
    )
}

#[tauri::command]
pub fn get_users(state: State<AppState>) -> Result<Vec<User>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    db::fetch_users(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn upsert_user(
    state: State<AppState>,
    id: String,
    name: String,
    color: String,
) -> Result<User, String> {
    let name = name.trim();
    if name.is_empty() {
        return Err("El nombre no puede estar vacío".into());
    }

    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let exists: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM users WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if exists > 0 {
        conn.execute(
            "UPDATE users SET name = ?1, color = ?2 WHERE id = ?3",
            params![name, color, id],
        )
        .map_err(|e| e.to_string())?;
    } else {
        conn.execute(
            "INSERT INTO users (id, name, color) VALUES (?1, ?2, ?3)",
            params![id, name, color],
        )
        .map_err(|e| e.to_string())?;
    }

    user_by_id(&conn, &id).map_err(|e| e.to_string())
}
