extern crate async_trait;
extern crate reqwest;
extern crate serde;

use std::any::Any;
use std::cmp::Ordering;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};

use super::{
    GachaRecord, GachaRecordFetcher, GachaRecordFetcherChannel, GachaUrl, GachaUrlFinder,
    GameDataDirectoryFinder,
};

use crate::error::Result;
use async_trait::async_trait;
use linkify::LinkFinder;
use reqwest::Client as Reqwest;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use tracing::info;
use url::Url;

#[derive(Default, Deserialize)]
pub struct WutheringWavesGacha;

/// Game Directory
impl GameDataDirectoryFinder for WutheringWavesGacha {
    fn find_game_data_directories(&self) -> Result<Vec<PathBuf>> {
        let mut directories = Vec::new();

        Ok(directories)
    }
}

/// Gacha URL
const ENDPOINT: &str = "aki/gacha/index.html";

impl GachaUrlFinder for WutheringWavesGacha {
    fn find_gacha_urls<P: AsRef<Path>>(&self, game_data_dir: P) -> Result<Vec<GachaUrl>> {
        let mut result = Vec::new();

        let logs_file = game_data_dir.as_ref().join("Client/Saved/Logs/Client.log");
        println!("{:?}", logs_file);
        let file = File::open(logs_file)?;
        let lines = BufReader::new(file).lines();
        for line in lines.flatten() {
            if line.contains(ENDPOINT) {
                println!("{}", line);
                let finder = LinkFinder::new();
                let links: Vec<_> = finder.links(&line).collect();
                assert_eq!(1, links.len());
                let url = &links[0];
                println!("{:?}", url.as_str());
                result.push(GachaUrl {
                    addr: 0,
                    creation_time: OffsetDateTime::now_utc(),
                    value: url.as_str().to_string(),
                })
            }
        }

        Ok(result)
    }
}

/// Gacha Record
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct WutheringWavesGachaRecord {
    pub id: String,
    pub uid: String,
    pub gacha_id: String,
    pub gacha_type: String,
}

impl GachaRecord for WutheringWavesGachaRecord {
    fn id(&self) -> &str {
        &self.id
    }

    fn as_any(&self) -> &dyn Any {
        self
    }
}

impl PartialOrd for WutheringWavesGachaRecord {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        self.id.partial_cmp(&other.id)
    }
}
