#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod logging;
mod models;

use std::sync::Mutex;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::{Emitter, Manager};

pub struct AppState {
    pub db: Mutex<rusqlite::Connection>,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .menu(|app| {
            let add = MenuItem::with_id(
                app,
                "add-movie",
                "Agregar película",
                true,
                Some("Ctrl+N"),
            )?;
            let add_serie = MenuItem::with_id(
                app,
                "add-serie",
                "Agregar serie",
                true,
                Some("Ctrl+Shift+S"),
            )?;
            let toggle = MenuItem::with_id(
                app,
                "toggle-theme",
                "Alternar tema",
                true,
                Some("Ctrl+Shift+D"),
            )?;

            let peliculas =
                Submenu::with_items(app, "Películas", true, &[&add, &add_serie])?;
            let editar = Submenu::with_items(
                app,
                "Editar",
                true,
                &[
                    &PredefinedMenuItem::undo(app, None)?,
                    &PredefinedMenuItem::redo(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(app, None)?,
                    &PredefinedMenuItem::copy(app, None)?,
                    &PredefinedMenuItem::paste(app, None)?,
                    &PredefinedMenuItem::select_all(app, None)?,
                ],
            )?;
            let vista = Submenu::with_items(app, "Vista", true, &[&toggle])?;
            let ayuda = Submenu::with_items(
                app,
                "Ayuda",
                true,
                &[&PredefinedMenuItem::quit(app, Some("Cerrar"))?],
            )?;

            Menu::with_items(app, &[&peliculas, &editar, &vista, &ayuda])
        })
        .on_menu_event(|app, event| {
            let _ = app.emit("menu", event.id().as_ref());
        })
        .setup(|app| {
            let _log_file = logging::init(app.handle())?;
            let dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dir)?;
            let db_path = dir.join("libreta.db");
            let conn = db::init(db_path.clone())?;
            log::info!("Base de datos lista en {}", db_path.display());
            db::seed(&conn)?;
            app.manage(AppState {
                db: Mutex::new(conn),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::backup::export_backup,
            commands::backup::import_backup,
            commands::backup::write_backup_file,
            commands::backup::read_backup_file,
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
