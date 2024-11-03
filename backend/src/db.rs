use std::{
    collections::{HashMap, HashSet},
    path::PathBuf,
};

use anyhow::Result;
use walkdir::WalkDir;

use crate::{node::Node, parser::parse_file};

#[derive(Clone)]
pub struct Db {
    pub id_map: HashMap<String, Node>,
    pub aliases: HashMap<String, HashSet<String>>, // List of all aliases to node ids
    pub tags: HashMap<String, HashSet<String>>,    // List of all tags to node ids
}

impl Db {
    pub fn new(input_dir: PathBuf) -> Result<Self> {
        let mut id_map = HashMap::new();
        let mut aliases = HashMap::new();
        let mut tags = HashMap::new();

        for entry in WalkDir::new(input_dir) {
            let entry = entry?;
            if entry.path().extension().map_or(false, |ext| ext == "org") {
                match parse_file(&entry.path().to_path_buf()) {
                    Ok(node) => {
                        // Add to id_map
                        id_map.insert(node.id.clone(), node.clone());

                        // Add all aliases
                        for alias in &node.aliases {
                            aliases
                                .entry(alias.clone())
                                .or_insert_with(HashSet::new)
                                .insert(node.id.clone());
                        }

                        // Add all tags
                        for tag in &node.tags {
                            tags.entry(tag.clone())
                                .or_insert_with(HashSet::new)
                                .insert(node.id.clone());
                        }
                    }
                    Err(e) => eprintln!("Error parsing {}: {}", entry.path().display(), e),
                }
            }
        }

        Ok(Db {
            id_map,
            aliases,
            tags,
        })
    }
}
