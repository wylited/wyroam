mod db;
mod cli;
mod node;
mod parser;
mod router;

use anyhow::Result;
use db::Db;
use clap::Parser;
use cli::Cli;
use router::router;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();

    let db = Db::new(cli.input.clone()).map_err(|e| anyhow::anyhow!("db initialization failed: {}", e))?;

    let listener = tokio::net::TcpListener::bind("localhost:3000").await
        .map_err(|e| anyhow::anyhow!("failed to bind listener: {}", e))?;

    axum::serve(listener, router(cli.input.clone()).with_state(db)).await
        .map_err(|e| anyhow::anyhow!("server error: {}", e))?;

    Ok(())
}
