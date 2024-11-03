use async_graphql::{Object, Schema, EmptyMutation, EmptySubscription, SimpleObject};
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::Extension;
use std::sync::Arc;
use crate::db::Db;
use crate::node::Node;

#[derive(SimpleObject, Clone)]
pub struct NodeQL {
    id: String,
    filename: String,
    title: String,
    aliases: Vec<String>,
    tags: Vec<String>,
    links: Vec<String>,
    html: String,
}

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
    pub db: Arc<Db>,
}

#[Object]
impl QueryRoot {
    async fn node(&self, id: String) -> Option<NodeQL> {
        self.db.id_map.get(&id).cloned().map(NodeQL::from)
    }

    async fn nodes_by_alias(&self, alias: String) -> Vec<NodeQL> {
        self.db
            .aliases
            .get(&alias)
            .map(|ids| {
                ids.iter()
                    .filter_map(|id| self.db.id_map.get(id))
                    .cloned()
                    .map(NodeQL::from)
                    .collect()
            })
            .unwrap_or_default()
    }

    async fn nodes_by_tag(&self, tag: String) -> Vec<NodeQL> {
        self.db
            .tags
            .get(&tag)
            .map(|ids| {
                ids.iter()
                    .filter_map(|id| self.db.id_map.get(id))
                    .cloned()
                    .map(NodeQL::from)
                    .collect()
            })
            .unwrap_or_default()
    }

    async fn alias_count(&self, alias: String) -> usize {
        self.db
            .aliases
            .get(&alias)
            .map(|ids| ids.len())
            .unwrap_or(0)
    }

    async fn tag_count(&self, tag: String) -> usize {
        self.db
            .tags
            .get(&tag)
            .map(|ids| ids.len())
            .unwrap_or(0)
    }
}

// Integration with Axum
pub async fn graphql_handler(
    schema: Extension<Schema<QueryRoot, EmptyMutation, EmptySubscription>>,
    req: GraphQLRequest,
) -> GraphQLResponse {
    schema.execute(req.into_inner()).await.into()
}
