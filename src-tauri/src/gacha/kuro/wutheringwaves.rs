extern crate async_trait;
extern crate reqwest;
extern crate serde;

use std::any::Any;
use std::cmp::Ordering;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use time::macros::format_description;

use crate::error::Result;
use crate::gacha::kuro::kuro::fetch_kuro_gacha_records;
use crate::gacha::{GachaRecord, GachaUrl, GachaUrlFinder, GameDataDirectoryFinder};
use async_trait::async_trait;
use linkify::LinkFinder;
use reqwest::Client as Reqwest;
use serde::{Deserialize, Serialize};
use time::{OffsetDateTime, PrimitiveDateTime};
use tracing::{debug, info};
use url::Url;

use super::kuro::{KuroGachaRecordFetcher, KuroGachaRecordFetcherChannel};

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
const ENDPOINT: &str = "aki/gacha/index.html#/record?";

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
                    addr: None,
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
    pub id: Option<i32>,
    pub uid: Option<String>,
    pub gacha_type: Option<String>,
    #[serde(rename = "cardPoolType")]
    pub card_pool_type: String,
    #[serde(rename = "resourceId")]
    pub resource_id: i32,
    #[serde(rename = "qualityLevel")]
    pub quality_level: i32,
    #[serde(rename = "resourceType")]
    pub resource_type: String,
    pub name: String,
    pub count: i32,
    pub time: String,
}

impl GachaRecord for WutheringWavesGachaRecord {
    fn id(&self) -> String {
        self.id.unwrap().to_string()
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

/// Gacha Record Fetcher
#[async_trait]
impl KuroGachaRecordFetcher for WutheringWavesGacha {
    type Target = WutheringWavesGachaRecord;

    async fn fetch_gacha_records(
        &self,
        reqwest: &Reqwest,
        uid: &str,
        gacha_url: &str,
        gacha_type: Option<&str>,
        last_time: Option<&str>,
    ) -> Result<Option<Vec<Self::Target>>> {
        let response = fetch_kuro_gacha_records::<Vec<WutheringWavesGachaRecord>>(
            reqwest, ENDPOINT, gacha_url, gacha_type,
        )
        .await?;

        let format = format_description!("[year]-[month]-[day] [hour]:[minute]:[second]");
        let data = response.data.unwrap();
        let updata = data
            .iter()
            .filter(|record| {
                if let Some(last_time) = last_time {
                    let now_odt = OffsetDateTime::now_utc();
                    let now_pdt = PrimitiveDateTime::new(now_odt.date(), now_odt.time());

                    let record_time =
                        PrimitiveDateTime::parse(&record.time, &format).unwrap_or(now_pdt);
                    let filter_time =
                        PrimitiveDateTime::parse(last_time, &format).unwrap_or(now_pdt);
                    return record_time > filter_time;
                }

                true
            })
            .map(|record| {
                let mut record = record.clone();
                record.uid = Some(String::from(uid));
                record.gacha_type = gacha_type.map(str::to_string);
                record
            })
            .collect();
        Ok(Some(updata))
    }
}

#[async_trait]
impl KuroGachaRecordFetcherChannel<WutheringWavesGachaRecord> for WutheringWavesGacha {
    type Fetcher = Self;
}
