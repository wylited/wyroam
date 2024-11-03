use orgize::Org;

#[derive(Debug)]
pub struct OrgNode {
    pub filename: String,
    pub title: String,
    pub org: Org,
}
