use std::path::PathBuf;
use tower_http::{
    services::ServeDir,
    cors::{CorsLayer, Any}, // Add this import
};
use axum::{
    routing::{get, post}, Router, Extension
};
use std::sync::Arc;

use crate::{db::Db, graphql::{self, QueryRoot}};
use async_graphql::{EmptySubscription, EmptyMutation, Schema};

pub fn router(input: PathBuf, db: Db) -> Router {
    let schema = Schema::build(QueryRoot { db: Arc::new(db) }, EmptyMutation, EmptySubscription)
        .finish();

    // Add CORS middleware
    let cors = CorsLayer::new()
        // Allow `Content-Type` header
        .allow_headers([http::header::CONTENT_TYPE])
        // Allow requests from any origin
        .allow_origin(Any)
        .allow_methods([http::Method::GET, http::Method::POST]);

    Router::new()
        .route("/", get(root))
        .route("/graph", post(graphql::graphql_handler))
        .nest_service(
            "/notes",
            ServeDir::new(input),
        )
        .layer(Extension(schema))
        .layer(cors) // Add the CORS middleware
}

async fn root() -> &'static str {
    "Wyroam Backend"
}
