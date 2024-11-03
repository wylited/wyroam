use std::path::PathBuf;
use tower_http::{
    services::{ServeDir},
};
use axum::{
    routing::{get}, Router,
};

use crate::db::Db;

pub fn router(input: PathBuf, db: Db) -> Router {
    Router::new()
        .route("/", get(root)) // root
        .nest_service(
            "/notes",
            ServeDir::new(input),
        ) // Serve the raw note files as well!

}

// basic handler that responds with a static string
async fn root() -> &'static str {
    "Wyroam Backend"
}
