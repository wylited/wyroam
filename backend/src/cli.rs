use clap::{Parser};
use std::path::PathBuf;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
pub struct Cli {
    // Directory to input org files
    #[arg(short, long)]
    pub input: PathBuf,
}
