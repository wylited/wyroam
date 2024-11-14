mod db;
mod cli;
mod node;
mod parser;
mod router;
mod graphql;

use anyhow::Result;
use clap::Parser;
use cli::Cli;
use db::LiveDb;
use router::router;
use tracing::Level;
use tracing_subscriber::{EnvFilter, fmt::format::FmtSpan};

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    // Initialize logger only if --log flag is present
    if cli.log {
        tracing_subscriber::fmt()
            .with_env_filter(EnvFilter::from_default_env()
                .add_directive(Level::INFO.into())
            )
            .with_span_events(FmtSpan::CLOSE)
            .init();
    }

    // Initialize LiveDB
    let live_db = LiveDb::new(cli.input.clone())
        .map_err(|e| anyhow::anyhow!("db initialization failed: {}", e))?;
    let db = live_db.get_db();

    // Try to host API
    let listener = tokio::net::TcpListener::bind("localhost:4000").await
        .map_err(|e| anyhow::anyhow!("failed to bind listener: {}", e))?;

    // Keep LiveDb alive
    let _live_db = live_db; // Move live_db into this variable to keep it alive

    axum::serve(listener, router(cli.input.clone(), db)).await
        .map_err(|e| anyhow::anyhow!("server error: {}", e))?;

    Ok(())
}
