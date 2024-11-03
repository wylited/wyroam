mod app;
mod cli;
mod node;
mod parser;

use anyhow::Result;
use clap::Parser;
use cli::{Cli, Commands};
use std::{fs::File, io::Write};
use walkdir::WalkDir;

use crate::node::Node;

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Parse { input, output } => {
            let mut nodes: Vec<Node> = Vec::new();

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

            let output_file = format!("{}/output.json", output.display());
            let mut file = File::create(output_file)?;
            let json_data = serde_json::to_string_pretty(&nodes)?;
            file.write_all(json_data.as_bytes())?;

            println!("Parsed {} org files", nodes.len());
        }

        Commands::Web { file: _ } => {
            todo!();
        }
    }

    Ok(())
}
