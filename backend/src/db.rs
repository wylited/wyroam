use anyhow::Result;
use rayon::prelude::*;
use std::{
    collections::{HashMap, HashSet},
    path::PathBuf,
    sync::Mutex,
};
use walkdir::WalkDir;

use crate::{node::Node, parser::parse_file};

#[derive(Clone)]
pub struct Db {
    pub id_map: HashMap<String, Node>,
    pub aliases: HashMap<String, HashSet<String>>,
    pub tags: HashMap<String, HashSet<String>>,
}

impl Db {
    pub fn new(input_dir: PathBuf) -> Result<Self> {
        // Collect all .org files first
        let org_files: Vec<PathBuf> = WalkDir::new(input_dir)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().extension().map_or(false, |ext| ext == "org"))
            .map(|e| e.path().to_path_buf())
            .collect();

        // Create thread-safe containers
        let id_map = Mutex::new(HashMap::new());
        let aliases = Mutex::new(HashMap::new());
        let tags = Mutex::new(HashMap::new());

        // Process files in parallel
        org_files.par_iter().for_each(|path| {
            if let Ok(node) = parse_file(path) {
                // Update id_map
                id_map.lock().unwrap().insert(node.id.clone(), node.clone());

                // Update aliases
                let mut aliases_guard = aliases.lock().unwrap();
                for alias in &node.aliases {
                    aliases_guard
                        .entry(alias.clone())
                        .or_insert_with(HashSet::new)
                        .insert(node.id.clone());
                }

                // Update tags
                let mut tags_guard = tags.lock().unwrap();
                for tag in &node.tags {
                    tags_guard
                        .entry(tag.clone())
                        .or_insert_with(HashSet::new)
                        .insert(node.id.clone());
                }
            }
        });

        // Convert back to regular HashMaps
        Ok(Db {
            id_map: id_map.into_inner().unwrap(),
            aliases: aliases.into_inner().unwrap(),
            tags: tags.into_inner().unwrap(),
        })
    }
}
