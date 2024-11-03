use std::collections::{HashMap, HashSet};

use crate::node::Node;

pub struct App {
    pub id_map: HashMap<String, Node>,
    pub aliases: HashSet<String>, // list of all aliases
    pub tags: HashSet<String>,    // List of all tags
}
