use clap::Parser;
use std::path::PathBuf;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
pub struct Cli {
    #[arg(short, long)]
    pub input: PathBuf,
    // expect an input file directory
    #[arg(short, long)]
    pub log: bool,
    // if the flag --log is present, then true.
}
