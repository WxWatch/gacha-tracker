#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

extern crate tauri;
extern crate tracing;
extern crate tracing_subscriber;

mod commands;
mod constants;
mod disk_cache;
mod error;
mod gacha;
mod storage;

fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .with_env_filter("gacha_tracker=debug,hyper=warn") // TODO: production
        .init();

    tauri::Builder::default()
        .plugin(storage::StoragePluginBuilder::new().build())
        .plugin(gacha::plugin::GachaPluginBuilder::new().build())
        .setup(|app| {
            use tauri::Manager;
            #[cfg(debug_assertions)]
            app.get_window("main").unwrap().open_devtools();
            Ok(())
        })
        .invoke_handler(commands::get_handlers())
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
