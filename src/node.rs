use std::collections::HashSet;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    pub filename: String,
    pub title: String,
    pub aliases: HashSet<String>,
    pub tags: HashSet<String>,
    pub links: HashSet<String>,
    pub html: String,
}
