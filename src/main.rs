mod cli;
mod node;
mod parser;

use anyhow::Result;
use clap::Parser;
use cli::{Cli, Commands};
use std::{fs::File, io::Write};
use walkdir::WalkDir;

use crate::node::OrgNode;

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Parse { input, output } => {
            let mut nodes: Vec<OrgNode> = Vec::new();

            // Walk through the directory and parse all .org files
            for entry in WalkDir::new(input) {
                let entry = entry?;
                if entry.path().extension().map_or(false, |ext| ext == "org") {
                    match parser::parse_org_file(&entry.path().to_path_buf()) {
                        Ok(doc) => nodes.push(doc),
                        Err(e) => eprintln!("Error parsing {}: {}", entry.path().display(), e),
                    }
                }
            }

            // Save to html file
            for node in &nodes {
                let html = node.org.to_html();
                // Create the full path for the file
                let full_path = format!("{}/{}.html", output.display(), node.filename);

                // Create the directory if it doesn't exist
                std::fs::create_dir_all(output.clone())?;

                // Create a new file and write the HTML content to it
                let mut file = File::create(&full_path)?;
                file.write_all(html.as_bytes())?;
            }
            println!("Parsed {} org files", nodes.len());
        }

        Commands::Web { file: _ } => {
            todo!();
        }
    }

    Ok(())
}
