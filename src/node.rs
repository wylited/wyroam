use std::collections::HashSet;

use axum::{extract::{Path, State}, response::Html, Json};
use serde::{Deserialize, Serialize};

use crate::db::Db;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Node {
    pub id: String,
    pub filename: String,
    pub title: String,
    pub aliases: HashSet<String>,
    pub tags: HashSet<String>,
    pub links: HashSet<String>,
    pub html: String,
}

pub async fn node(
    State(db): State<Db>,
    Path(id): Path<String>,
) -> Json<Option<Node>> {
    if let Some(node) = db.id_map.get(&id) {
        Json(Some(node.clone()))
    } else {
        Json(None)
    }
}

pub async fn node_id(
    State(db): State<Db>,
    Path(id): Path<String>,
) -> Json<Option<String>> {
    if let Some(node) = db.id_map.get(&id) {
        Json(Some(node.id.clone()))
    } else {
        Json(None)
    }
}

pub async fn node_filename(
    State(db): State<Db>,
    Path(id): Path<String>,
) -> Json<Option<String>> {
    if let Some(node) = db.id_map.get(&id) {
        Json(Some(node.filename.clone()))
    } else {
        Json(None)
    }
}

pub async fn node_title(
    State(db): State<Db>,
    Path(id): Path<String>,
) -> Json<Option<String>> {
    if let Some(node) = db.id_map.get(&id) {
        Json(Some(node.title.clone()))
    } else {
        Json(None)
    }
}

pub async fn node_aliases(
    State(db): State<Db>,
    Path(id): Path<String>,
) -> Json<Option<HashSet<String>>> {
    if let Some(node) = db.id_map.get(&id) {
        Json(Some(node.aliases.clone()))
    } else {
        Json(None)
    }
}

pub async fn node_tags(
    State(db): State<Db>,
    Path(id): Path<String>,
) -> Json<Option<HashSet<String>>> {
    if let Some(node) = db.id_map.get(&id) {
        Json(Some(node.tags.clone()))
    } else {
        Json(None)
    }
}

pub async fn node_links(
    State(db): State<Db>,
    Path(id): Path<String>,
) -> Json<Option<HashSet<String>>> {
    if let Some(node) = db.id_map.get(&id) {
        Json(Some(node.links.clone()))
    } else {
        Json(None)
    }
}

pub async fn node_html(
    State(db): State<Db>,
    Path(id): Path<String>,
) -> Result<Html<String>, Html<String>> {
    if let Some(node) = db.id_map.get(&id) {
        Ok(Html(node.html.clone()))
    } else {
        Err(Html("<h1>404 Not Found</h1>".to_string()))
    }
}
