use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    pub filename: String,
    pub title: String,
    pub aliases: Vec<String>,
    pub tags: Vec<String>,
    pub html: String,
}
