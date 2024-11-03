use crate::node::Node;
use anyhow::Result;
use orgize::Org;
use std::fs;
use std::path::PathBuf;

pub fn parse_org_file(path: &PathBuf) -> Result<Node> {
    let content = fs::read_to_string(path)?;
    let filename = path
        .file_name()
        .ok_or_else(|| anyhow::anyhow!("Invalid filename"))?
        .to_string_lossy()
        .into_owned();

    let org = Org::parse(&content);
    let properties = org
        .document()
        .properties()
        .ok_or_else(|| anyhow::anyhow!("No properties found"))?
        .to_hash_map();

    let id = properties
        .get("ID")
        .ok_or_else(|| anyhow::anyhow!("No ID property found"))?
        .to_string();

    let aliases = properties
        .get("ROAM_ALIASES")
        .map(|s| s.split_whitespace().map(String::from).collect())
        .unwrap_or_else(|| Vec::new());

    let tags = org
        .document()
        .keywords()
        .find(|keyword| keyword.key() == "filetags")
        .map(|keyword| keyword.value().split(':').map(String::from).collect())
        .unwrap_or_else(|| Vec::new());

    Ok(Node {
        filename,
        id,
        aliases,
        tags,
        title: org.title().unwrap_or_else(|| "titleless".to_string()),
        html: org.to_html(),
    })
}
