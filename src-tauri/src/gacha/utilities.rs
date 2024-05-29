extern crate lazy_static;
extern crate reqwest;
extern crate serde;
extern crate time;
extern crate tokio;
extern crate tracing;
extern crate url;

use crate::constants;
use crate::disk_cache::{BlockFile, EntryStore, IndexFile};
use crate::error::{Error, Result};
use crate::storage::entity_account::AccountFacet;
use lazy_static::lazy_static;
use reqwest::Client as Reqwest;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use std::collections::hash_map::Entry;
use std::collections::HashMap;
use std::fs::File;
use std::io::{prelude::BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::str::FromStr;
use time::{OffsetDateTime, UtcOffset};
use tokio::sync::Mutex;
use tracing::debug;
use url::Url;

use super::gacha::{GachaRecord, GachaUrl};

pub(super) fn create_default_reqwest() -> Result<reqwest::Client> {
    Ok(reqwest::Client::builder()
        .user_agent(format!(
            "{} v{} by {}",
            constants::NAME,
            constants::VERSION,
            constants::AUTHOR
        ))
        .build()?)
}

pub(super) fn lookup_path_line_from_keyword<P: AsRef<Path>>(
    path: P,
    keyword: &str,
) -> Result<Option<PathBuf>> {
    if !path.as_ref().exists() || !path.as_ref().is_file() {
        return Ok(None);
    }

    let file = File::open(path)?;
    let reader = BufReader::new(file);

    for line in reader.lines().map(|l| l.unwrap()) {
        if !line.contains(keyword) {
            continue;
        }

        if let Some(colon) = line.rfind(':') {
            if let Some(end) = line.find(keyword) {
                let path = &line[colon - 1..end + keyword.len()];
                return Ok(Some(Path::new(path).to_path_buf()));
            }
        }
    }

    Ok(None)
}

mod web_caches {
    use super::Error;
    use std::num::ParseIntError;
    use std::str::FromStr;

    #[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
    pub struct WebCachesVersion {
        major: u8,
        minor: u8,
        patch: u8,
        build: u8,
    }

    impl WebCachesVersion {
        pub fn version(&self) -> String {
            format!(
                "{}.{}.{}.{}",
                self.major, self.minor, self.patch, self.build
            )
        }
    }

    impl From<ParseIntError> for Error {
        fn from(_: ParseIntError) -> Self {
            Self::WebCaches
        }
    }

    impl FromStr for WebCachesVersion {
        type Err = Error;

        fn from_str(s: &str) -> std::result::Result<Self, Self::Err> {
            let mut s = s.split('.');
            match (s.next(), s.next(), s.next(), s.next()) {
                (Some(major), Some(minor), Some(patch), build_opt) => Ok(WebCachesVersion {
                    major: major.parse()?,
                    minor: minor.parse()?,
                    patch: patch.parse()?,
                    build: build_opt.unwrap_or("0").parse()?,
                }),
                _ => Err(Error::WebCaches),
            }
        }
    }
}

pub(super) fn lookup_valid_cache_data_dir<P: AsRef<Path>>(game_data_dir: P) -> Result<PathBuf> {
    use self::web_caches::WebCachesVersion;
    use std::fs::read_dir;

    let mut web_caches_versions = Vec::new();

    // Read webCaches directory
    let web_caches_dir = game_data_dir.as_ref().join("webCaches");
    for entry in read_dir(&web_caches_dir)? {
        let entry = entry?;
        let entry_path = entry.path();
        if !entry_path.is_dir() {
            continue;
        }

        let entry_name = entry_path.file_name().unwrap().to_string_lossy();
        if let Ok(version) = WebCachesVersion::from_str(&entry_name) {
            // Matches version: `x.y.z.a` or `x.y.z`
            web_caches_versions.push(version);
        }
    }

    // Sort by version asc
    web_caches_versions.sort();

    // Get the latest version
    let latest = web_caches_versions.last().ok_or(Error::WebCaches)?;
    let cache_data_dir = web_caches_dir
        .join(latest.version())
        .join("Cache")
        .join("Cache_Data");

    Ok(cache_data_dir)
}

pub(super) fn lookup_gacha_urls_from_endpoint<P: AsRef<Path>>(
    cache_data_dir: P,
    endpoint: &str,
) -> Result<Vec<GachaUrl>> {
    let cache_data_dir = cache_data_dir.as_ref();

    // Read index file and data_1, data_2 block files
    let index_file = IndexFile::from_file(cache_data_dir.join("index"))?;
    let block_file1 = BlockFile::from_file(cache_data_dir.join("data_1"))?;
    let block_file2 = BlockFile::from_file(cache_data_dir.join("data_2"))?;

    let mut result = Vec::new();
    let current_local_offset = UtcOffset::current_local_offset().map_err(time::Error::from)?;

    // Foreach the cache address table of the index file
    for addr in index_file.table {
        // Read the entry store from the data_1 block file by cache address
        let entry = EntryStore::from_block_file(&block_file1, &addr)?;

        // Gacha url must be a long key and stored in the data_2 block file,
        // So the long key of entry must not be zero.
        if !entry.is_long_url() {
            continue;
        }

        // Read the long url of entry store from the data_2 block file
        let url = entry.read_long_url(&block_file2)?;

        // Get only valid gacha url
        if !url.contains(endpoint) && !url.contains("&gacha_type=") {
            continue;
        }

        let mut url = url.to_string();

        // These url start with '1/0/', only get the later part
        if url.starts_with("1/0/") {
            url = url[4..].to_string();
        }

        // Convert creation time
        let creation_time = {
            let timestamp = (entry.creation_time / 1_000_000) as i64 - 11_644_473_600;
            let offset_datetime =
                OffsetDateTime::from_unix_timestamp(timestamp).map_err(time::Error::from)?;
            offset_datetime.to_offset(current_local_offset)
        };

        result.push(GachaUrl {
            addr: addr.into(),
            creation_time,
            value: url,
        })
    }

    // Sort by creation time desc
    result.sort_by(|a, b| b.creation_time.cmp(&a.creation_time));

    Ok(result)
}

#[derive(Deserialize)]
pub(super) struct GachaResponse<T> {
    pub retcode: Option<i32>,
    pub message: String,
    pub data: Option<T>,
}

//- Find the Gacha url and validate consistency
//  Hashmap<String, GachaUrl> GACHA_URL_CACHED
//    key: facet + uid + addr
//    value: GachaUrl

lazy_static! {
    pub static ref GACHA_URL_CACHED: Mutex<HashMap<String, GachaUrl>> = Default::default();
}
