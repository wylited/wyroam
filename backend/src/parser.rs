use crate::node::Node;
use anyhow::Result;
use orgize::{
    export::{from_fn, Container, Event},
    Org,
};
use std::{collections::HashSet, fs, path::PathBuf};

pub fn parse_file(path: &PathBuf) -> Result<Node> {
    let content = fs::read_to_string(path)?; // Read the file to a string

    // Extract the filename from the path
    let filename = path
        .file_name()
        .ok_or_else(|| anyhow::anyhow!("Invalid filename"))?
        .to_string_lossy()
        .into_owned();

    // Parse the org file
    let org = Org::parse(&content);
    // Extract the properties from the org file using orgize
    let properties = org
        .document()
        .properties()
        .ok_or_else(|| anyhow::anyhow!("No properties found"))?
        .to_hash_map();

    // Extract the ID from the properties
    let id = properties
        .get("ID")
        .ok_or_else(|| anyhow::anyhow!("No ID property found"))?
        .to_string();

    // Extract the aliases from the properties
    let aliases: HashSet<String> = properties
        .get("ROAM_ALIASES")
        .map(|s| s.split_whitespace().map(String::from).collect())
        .unwrap_or_else(HashSet::new);

    // Extract the tags from the properties
    let tags: HashSet<String> = org
        .document()
        .keywords()
        .find(|keyword| keyword.key() == "filetags")
        .map(|keyword| keyword.value().split(':').map(String::from).collect())
        .unwrap_or_else(HashSet::new);

    // Create a hashset of links to extract the links from the org file to other nodes
    let mut links = HashSet::new();
    // match function to determine if the value in the abstract syntax tree is a link
    let mut links_handler = from_fn(|event| {
        if matches!(event, Event::Enter(Container::Link(_))) {
            if let Event::Enter(Container::Link(value)) = event {
                links.insert(value.path().to_string());
            }
        }
    });

    // Traverse the org file to extract the links using the match function
    org.traverse(&mut links_handler);

    // Return our node
    Ok(Node {
        filename,
        id,
        aliases,
        tags,
        links,
        title: org.title().unwrap_or_else(|| "titleless".to_string()),
        html: org.to_html(),
    })
}
