use anyhow::Result;
use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use rayon::prelude::*;
use std::{
    collections::{HashMap, HashSet},
    path::PathBuf,
    sync::{Arc, Mutex},
};
use tokio::time::Instant;
use tracing::{error, info};
use walkdir::WalkDir;

use crate::{node::Node, parser::parse_file};

pub struct LiveDb {
    db: Arc<Mutex<Db>>,
    _watcher: RecommendedWatcher, // Keep the watcher alive
}

impl LiveDb {
    pub fn new(input_dir: PathBuf) -> Result<Self> {
        info!("Initializing LiveDb from directory: {:?}", input_dir);
        let db = Arc::new(Mutex::new(Db::new(input_dir.clone())?));
        let db_clone = Arc::clone(&db);
        let input_dir_clone = input_dir.clone();

        let mut watcher = RecommendedWatcher::new(
            move |res: Result<Event, notify::Error>| {
                match res {
                    Ok(event) => {
                        // Only rebuild on Create, Modify, or Remove events
                        match event.kind {
                            EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_) => {
                                match Db::new(input_dir_clone.clone()) {
                                    Ok(new_db) => {
                                        if let Ok(mut db) = db_clone.lock() {
                                            *db = new_db;
                                            info!("Database successfully updated");
                                        } else {
                                            error!("Failed to acquire database lock for update");
                                        }
                                    }
                                    Err(e) => error!("Failed to rebuild database: {:?}", e),
                                }
                            }
                            _ => (),
                        }
                    }
                    Err(e) => error!("Error watching files: {:?}", e),
                }
            },
            Config::default(),
        )?;

        // Start watching the directory
        watcher.watch(&input_dir, RecursiveMode::Recursive)?;
        info!("Started watching directory: {:?}", input_dir);

        Ok(LiveDb {
            db,
            _watcher: watcher,
        })
    }

    pub fn get_db(&self) -> Arc<Mutex<Db>> {
        Arc::clone(&self.db)
    }
}

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
            let start = Instant::now();
            if let Ok(node) = parse_file(path) {
                let duration = start.elapsed();
                info!("Parsed file: {}, took: {:?}", path.display(), duration);
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
