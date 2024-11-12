use std::collections::HashSet;

use serde::{Deserialize, Serialize};

// Tags allow the data structure to be serialized and deserialized
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Node {
    pub id: String,               // The node's ID
    pub filename: String,         // It's filename
    pub title: String,            // The node's title
    pub aliases: HashSet<String>, // aliases stored in the node
    pub tags: HashSet<String>,    // tags stored in the node
    pub links: HashSet<String>,   // links stored in the node
    pub html: String,             // The org content of the node rendered into html
}
