use async_graphql::{Object, SimpleObject};
use std::sync::{Arc, Mutex};
use std::time::SystemTime;
use crate::db::Db;
use crate::node::Node;

// Node as a graphql object
#[derive(SimpleObject, Clone)]
pub struct NodeQL {
    id: String,
    filename: String,
    title: String,
    aliases: Vec<String>, // Have to replace the hashsets
    tags: Vec<String>,    // with vectors for data transfer
    links: Vec<String>,   // over graphql
    html: String,
}

// Node to NodeQL converter, simply
impl From<Node> for NodeQL {
    fn from(node: Node) -> Self {
        NodeQL {
            id: node.id,
            filename: node.filename,
            title: node.title,
            aliases: node.aliases.into_iter().collect(),
            tags: node.tags.into_iter().collect(),
            links: node.links.into_iter().collect(),
            html: node.html,
        }
    }
}

pub struct QueryRoot {
    pub db: Arc<Mutex<Db>>,
}

// QueryRoot object for graphql, each function is a possible query
#[Object]
impl QueryRoot {
    // Get all node ids
    async fn all_node_ids(&self) -> Vec<String> {
        self.db.lock()
            .unwrap()
            .id_map
            .keys()
            .cloned()
            .collect()
    }

    // Get all nodes
    async fn all_nodes(&self) -> Vec<NodeQL> {
        self.db.lock()
            .unwrap()
            .id_map
            .values()
            .cloned()
            .map(NodeQL::from)
            .collect()
    }

    // Get a node by id
    async fn node(&self, id: String) -> Option<NodeQL> {
        self.db.lock()
            .unwrap()
            .id_map
            .get(&id)
            .cloned()
            .map(NodeQL::from)
    }

    // Get a node by alias
    async fn nodes_by_alias(&self, alias: String) -> Vec<NodeQL> {
        let db = self.db.lock().unwrap();
        db.aliases
            .get(&alias)
            .map(|ids| {
                ids.iter()
                    .filter_map(|id| db.id_map.get(id))
                    .cloned()
                    .map(NodeQL::from)
                    .collect()
            })
            .unwrap_or_default()
    }

    // Get a node by tag
    async fn nodes_by_tag(&self, tag: String) -> Vec<NodeQL> {
        let db = self.db.lock().unwrap();
        db.tags
            .get(&tag)
            .map(|ids| {
                ids.iter()
                    .filter_map(|id| db.id_map.get(id))
                    .cloned()
                    .map(NodeQL::from)
                    .collect()
            })
            .unwrap_or_default()
    }

    // Get the total count of nodes with a certain alias
    async fn alias_count(&self, alias: String) -> usize {
        self.db.lock()
            .unwrap()
            .aliases
            .get(&alias)
            .map(|ids| ids.len())
            .unwrap_or(0)
    }

    // Get the total count of nodes with a certain tag
    async fn tag_count(&self, tag: String) -> usize {
        self.db.lock()
            .unwrap()
            .tags
            .get(&tag)
            .map(|ids| ids.len())
            .unwrap_or(0)
    }

    // Get the time since the last db update
    async fn last_updated(&self) -> String {
        self.db.lock()
            .unwrap()
            .last_updated
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs()
            .to_string()
    }
}
