use std::{path::PathBuf, sync::Mutex};
use async_graphql_axum::{GraphQL};
use tower_http::{
    services::ServeDir,
    cors::{CorsLayer, Any}, // Add this import
};
use axum::{
    response::{self, IntoResponse}, routing::get, Router
};
use std::sync::Arc;

use crate::{db::Db, graphql::QueryRoot};
use async_graphql::{http::GraphiQLSource, EmptyMutation, EmptySubscription, Schema};

pub fn router(input: PathBuf, db: Arc<Mutex<Db>>) -> Router {
    let schema = Schema::build(QueryRoot { db }, EmptyMutation, EmptySubscription)
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
        .route("/graphql", get(graphiql).post_service(GraphQL::new(schema.clone())))
        .nest_service( // allowing downloading all the notes for debugging purposes
            "/notes",
            ServeDir::new(input),
        )
        .layer(cors) // Add the CORS middleware
}

// Serve test string at root
async fn root() -> &'static str {
    "Wyroam Backend"
}

// Serve Graphql handler
async fn graphiql() -> impl IntoResponse {
    response::Html(GraphiQLSource::build().endpoint("/graphql").finish())
}
