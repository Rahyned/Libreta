use std::path::PathBuf;

use rusqlite::{params, Connection, Result};

use crate::models::{Movie, Rating, User};

pub fn init(path: PathBuf) -> Result<Connection> {
    let conn = Connection::open(path)?;
    conn.execute_batch(
        "PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT DEFAULT '#d4a5a5'
        );

        CREATE TABLE IF NOT EXISTS movies (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            year INTEGER,
            genre TEXT,
            added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            poster_url TEXT,
            notes TEXT,
            watched_at TEXT
        );

        CREATE TABLE IF NOT EXISTS ratings (
            id TEXT PRIMARY KEY,
            movie_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            rating REAL NOT NULL,
            mood TEXT,
            personal_note TEXT,
            rated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(movie_id) REFERENCES movies(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id),
            UNIQUE(movie_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_ratings_movie ON ratings(movie_id);
        CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
        ",
    )?;
    ensure_column(&conn, "movies", "watched_at", "TEXT")?;
    ensure_column(&conn, "movies", "watched", "INTEGER NOT NULL DEFAULT 1")?;
    ensure_column(&conn, "movies", "kind", "TEXT NOT NULL DEFAULT 'movie'")?;
    ensure_column(&conn, "movies", "seasons", "INTEGER")?;
    ensure_column(&conn, "movies", "status", "TEXT")?;
    Ok(conn)
}

fn has_column(conn: &Connection, table: &str, column: &str) -> Result<bool> {
    let mut stmt = conn.prepare(&format!("PRAGMA table_info({})", table))?;
    let names = stmt.query_map([], |row| row.get::<_, String>(1))?;
    for name in names {
        if name? == column {
            return Ok(true);
        }
    }
    Ok(false)
}

fn ensure_column(
    conn: &Connection,
    table: &str,
    column: &str,
    ddl: &str,
) -> Result<()> {
    if !has_column(conn, table, column)? {
        conn.execute(
            &format!("ALTER TABLE {} ADD COLUMN {} {}", table, column, ddl),
            [],
        )?;
    }
    Ok(())
}

pub fn seed(conn: &Connection) -> Result<()> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM users", [], |r| r.get(0))?;
    if count == 0 {
        conn.execute(
            "INSERT INTO users (id, name, color) VALUES (?1, ?2, ?3)",
            params!["user1", "Yo", "#d4a5a5"],
        )?;
        conn.execute(
            "INSERT INTO users (id, name, color) VALUES (?1, ?2, ?3)",
            params!["user2", "Mi pareja", "#a8d5d5"],
        )?;
    }
    Ok(())
}

pub fn fetch_users(conn: &Connection) -> Result<Vec<User>> {
    let mut stmt = conn.prepare("SELECT id, name, color FROM users ORDER BY rowid ASC")?;
    let rows = stmt.query_map([], |row| {
        Ok(User {
            id: row.get("id")?,
            name: row.get("name")?,
            color: row.get("color")?,
        })
    })?;
    rows.collect()
}

pub fn fetch_movies(conn: &Connection) -> Result<Vec<Movie>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, year, genre, added_date, poster_url, notes, watched_at, watched,
                kind, seasons, status
         FROM movies ORDER BY added_date DESC, rowid DESC",
    )?;
    let rows = stmt.query_map([], |row| {
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
    })?;
    rows.collect()
}

pub fn fetch_ratings(conn: &Connection) -> Result<Vec<Rating>> {
    let mut stmt = conn.prepare(
        "SELECT id, movie_id, user_id, rating, mood, personal_note, rated_date FROM ratings",
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(Rating {
            id: row.get("id")?,
            movie_id: row.get("movie_id")?,
            user_id: row.get("user_id")?,
            rating: row.get("rating")?,
            mood: row.get("mood")?,
            personal_note: row.get("personal_note")?,
            rated_date: row.get("rated_date")?,
        })
    })?;
    rows.collect()
}

pub fn get_setting(conn: &Connection, key: &str) -> Result<Option<String>> {
    let mut stmt = conn.prepare("SELECT value FROM settings WHERE key = ?1")?;
    let mut rows = stmt.query_map(params![key], |row| row.get::<_, String>(0))?;
    match rows.next() {
        Some(row) => Ok(Some(row?)),
        None => Ok(None),
    }
}

pub fn set_setting(conn: &Connection, key: &str, value: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![key, value],
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::params;

    fn temp_conn() -> Connection {
        init(PathBuf::from(":memory:")).expect("init ok")
    }

    #[test]
    fn init_creates_schema_and_seeds_users() {
        let conn = temp_conn();
        seed(&conn).expect("seed ok");
        let users = fetch_users(&conn).expect("fetch ok");
        assert_eq!(users.len(), 2);
        assert_eq!(users[0].name, "Yo");
        assert_eq!(users[1].name, "Mi pareja");
    }

    #[test]
    fn seed_is_idempotent() {
        let conn = temp_conn();
        seed(&conn).unwrap();
        seed(&conn).unwrap();
        assert_eq!(fetch_users(&conn).unwrap().len(), 2);
    }

    #[test]
    fn crud_movie_and_rating() {
        let conn = temp_conn();
        seed(&conn).unwrap();

        conn.execute(
            "INSERT INTO movies (id, title, year, genre, watched) VALUES (?1, ?2, ?3, ?4, 1)",
            params!["m1", "Dune", 2021, "Ciencia ficción"],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO ratings (id, movie_id, user_id, rating) VALUES (?1, ?2, ?3, ?4)",
            params!["r1", "m1", "user1", 4.5],
        )
        .unwrap();

        let movies = fetch_movies(&conn).unwrap();
        assert_eq!(movies.len(), 1);
        assert_eq!(movies[0].title, "Dune");
        assert_eq!(movies[0].year, Some(2021));
        assert!(movies[0].watched);

        let ratings = fetch_ratings(&conn).unwrap();
        assert_eq!(ratings.len(), 1);
        assert_eq!(ratings[0].rating, 4.5);
    }

    #[test]
    fn delete_movie_cascades_ratings() {
        let conn = temp_conn();
        seed(&conn).unwrap();
        conn.execute(
            "INSERT INTO movies (id, title, watched) VALUES ('m1', 'Dune', 1)",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO ratings (id, movie_id, user_id, rating) VALUES ('r1', 'm1', 'user1', 5)",
            [],
        )
        .unwrap();
        conn.execute("DELETE FROM movies WHERE id = 'm1'", [])
            .unwrap();
        assert!(fetch_movies(&conn).unwrap().is_empty());
        assert!(fetch_ratings(&conn).unwrap().is_empty());
    }

    #[test]
    fn settings_roundtrip() {
        let conn = temp_conn();
        assert_eq!(get_setting(&conn, "k").unwrap(), None);
        set_setting(&conn, "k", "v1").unwrap();
        set_setting(&conn, "k", "v2").unwrap();
        assert_eq!(get_setting(&conn, "k").unwrap(), Some("v2".to_string()));
    }

    #[test]
    fn movies_default_to_kind_movie_and_support_series() {
        let conn = temp_conn();
        seed(&conn).unwrap();
        conn.execute(
            "INSERT INTO movies (id, title, year, watched) VALUES ('m1', 'Dune', 2021, 1)",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO movies (id, title, year, watched, kind, seasons, status)
             VALUES ('s1', 'The Bear', 2022, 1, 'series', 3, 'Completada')",
            [],
        )
        .unwrap();

        let movies = fetch_movies(&conn).unwrap();
        let movie = movies.iter().find(|m| m.id == "m1").unwrap();
        assert_eq!(movie.kind, "movie");
        assert_eq!(movie.seasons, None);
        assert_eq!(movie.status, None);

        let series = movies.iter().find(|m| m.id == "s1").unwrap();
        assert_eq!(series.kind, "series");
        assert_eq!(series.seasons, Some(3));
        assert_eq!(series.status, Some("Completada".to_string()));
    }
}
