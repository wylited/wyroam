use crate::node::OrgNode;
use anyhow::Result;
use orgize::Org;
use std::fs;
use std::path::PathBuf;

pub fn parse_org_file(path: &PathBuf) -> Result<OrgNode> {
    let content = fs::read_to_string(path)?;
    let filename = path.file_name().unwrap().to_string_lossy().into_owned();

    let org = Org::parse(&content);

    Ok(OrgNode {
        filename,
        title: org.title().unwrap_or_else(|| "notitlelol".to_string()),
        org,
    })
}
