use std::path::PathBuf;
use tower_http::{
    services::{ServeDir},
};
use axum::{
    routing::{get}, Router, Extension
};
use std::sync::Arc;


use crate::{db::{Db}, graphql::{self, QueryRoot}};
use async_graphql::{EmptySubscription, EmptyMutation, Schema};


pub fn router(input: PathBuf, db: Db) -> Router {
    let schema = Schema::build(QueryRoot { db: Arc::new(db) }, EmptyMutation, EmptySubscription)
        .finish();
    Router::new()
        .route("/", get(root))
        .route("/db", get(graphql::graphql_handler))
        .nest_service(
            "/notes",
            ServeDir::new(input),
        )
        .layer(Extension(schema))
}
// basic handler that responds with a static string
async fn root() -> &'static str {
    "Wyroam Backend"
}
