use clap::{Parser, Subcommand};
use std::path::PathBuf;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    // Parse org files and output to JSON
    Parse {
        // Directory containing org files
        #[arg(short, long)]
        input: PathBuf,

        // Output JSON data file
        #[arg(short, long, default_value = "output/")]
        output: PathBuf,
    },
    // Generate web visualization
    Web {
        // Input JSON file
        #[arg(short, long)]
        file: PathBuf,
    },
}
