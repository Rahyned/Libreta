use std::path::PathBuf;

use tauri::{AppHandle, Manager};

pub fn init(app: &AppHandle) -> tauri::Result<PathBuf> {
    let dir = app.path().app_log_dir()?;
    std::fs::create_dir_all(&dir)?;
    let log_file = dir.join("app.log");

    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "[{}] [{}] {}",
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
                record.level(),
                message
            ))
        })
        .level(log::LevelFilter::Info)
        .level_for("tauri", log::LevelFilter::Warn)
        .level_for("hyper", log::LevelFilter::Warn)
        .level_for("reqwest", log::LevelFilter::Warn)
        .chain(std::io::stdout())
        .chain(fern::log_file(&log_file)?)
        .apply()
        .map_err(|e| std::io::Error::other(e.to_string()))?;

    log::info!(
        "Libreta v{} — logging iniciado en {}",
        env!("CARGO_PKG_VERSION"),
        log_file.display()
    );
    Ok(log_file)
}