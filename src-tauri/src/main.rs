#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod models;

use std::sync::Mutex;
use tauri::Manager;

pub struct AppState {
    pub db: Mutex<rusqlite::Connection>,
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dir)?;
            let conn = db::init(dir.join("libreta.db"))?;
            db::seed(&conn)?;
            app.manage(AppState {
                db: Mutex::new(conn),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::movies::get_movies,
            commands::movies::add_movie,
            commands::movies::update_movie,
            commands::movies::delete_movie,
            commands::ratings::get_ratings,
            commands::ratings::save_rating,
            commands::users::get_users,
            commands::users::upsert_user,
            commands::stats::get_stats,
            commands::stats::compare_ratings,
            commands::settings::get_setting,
            commands::settings::set_setting,
            commands::poster::search_movie,
        ])
        .run(tauri::generate_context!())
        .expect("error al ejecutar la aplicación");
}
