use std::path::PathBuf;
use tower_http::{
    services::{ServeDir},
};
use axum::{
    routing::{get}, Router,
};

use crate::{db::{self, Db}, node};


pub fn router(input: PathBuf) -> Router<Db> {
    Router::new()
        .route("/", get(root))
        .route("/nodes", get(db::ids))
        .route("/aliases", get(db::aliases))
        .route("/tags", get(db::tags))
        .route("/node/:id", get(node::node))
        .route("/node/:id/id", get(node::node_id))
        .route("/node/:id/filename", get(node::node_filename))
        .route("/node/:id/title", get(node::node_title))
        .route("/node/:id/aliases", get(node::node_aliases))
        .route("/node/:id/tags", get(node::node_tags))
        .route("/node/:id/links", get(node::node_links))
        .route("/node/:id/html", get(node::node_html))
        .nest_service(
            "/notes",
            ServeDir::new(input),
        )
}
// basic handler that responds with a static string
async fn root() -> &'static str {
    "Wyroam Backend"
}
