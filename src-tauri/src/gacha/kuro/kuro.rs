extern crate async_trait;
extern crate form_urlencoded;
extern crate reqwest;
extern crate serde;
extern crate time;
extern crate tokio;
extern crate url;

use crate::error::{Error, Result};
use crate::gacha::utilities::GachaResponse;
use crate::gacha::GachaRecord;
use async_trait::async_trait;
use reqwest::Client as Reqwest;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use std::any::Any;
use std::collections::{BTreeMap, HashMap};
use std::future::Future;
use std::path::{Path, PathBuf};
use time::OffsetDateTime;
use tracing::debug;
use url::Url;

/// Gacha Record Fetcher
#[async_trait]
pub trait KuroGachaRecordFetcher {
    type Target: GachaRecord;

    async fn fetch_gacha_records(
        &self,
        reqwest: &Reqwest,
        uid: &str,
        gacha_url: &str,
        gacha_type: Option<&str>,
        last_time: Option<&str>,
    ) -> Result<Option<Vec<Self::Target>>>;
}

/// Gacha Record Fetcher Channel

#[allow(unused)]
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum KuroGachaRecordFetcherChannelFragment<T: GachaRecord + Sized + Serialize + Send + Sync> {
    Sleeping,
    Ready(String),
    Pagination(u32),
    Data(Vec<T>),
    Finished,
}

#[async_trait]
pub trait KuroGachaRecordFetcherChannel<T: GachaRecord + Sized + Serialize + Send + Sync> {
    type Fetcher: KuroGachaRecordFetcher<Target = T> + Send + Sync;

    async fn pull_gacha_records(
        &self,
        reqwest: &Reqwest,
        fetcher: &Self::Fetcher,
        sender: &tokio::sync::mpsc::Sender<KuroGachaRecordFetcherChannelFragment<T>>,
        uid: &str,
        gacha_url: &str,
        gacha_type: &str,
        last_time: Option<&str>,
    ) -> Result<()> {
        const SLEEPING: u64 = 3;

        sender
            .send(KuroGachaRecordFetcherChannelFragment::Ready(
                gacha_type.to_owned(),
            ))
            .await
            .map_err(|_| Error::GachaRecordFetcherChannelSend)?;
        tokio::time::sleep(tokio::time::Duration::from_secs(SLEEPING)).await;

        let gacha_records = fetcher
            .fetch_gacha_records(reqwest, uid, gacha_url, Some(gacha_type), last_time)
            .await?;

        if let Some(gacha_records) = gacha_records {
            sender
                .send(KuroGachaRecordFetcherChannelFragment::Data(gacha_records))
                .await
                .map_err(|_| Error::GachaRecordFetcherChannelSend)?;
        }

        sender
            .send(KuroGachaRecordFetcherChannelFragment::Finished)
            .await
            .map_err(|_| Error::GachaRecordFetcherChannelSend)?;
        Ok(())
    }

    async fn pull_all_gacha_records(
        &self,
        reqwest: &Reqwest,
        fetcher: &Self::Fetcher,
        sender: &tokio::sync::mpsc::Sender<KuroGachaRecordFetcherChannelFragment<T>>,
        uid: &str,
        gacha_url: &str,
        gacha_type_and_last_time_mappings: &BTreeMap<String, Option<String>>,
    ) -> Result<()> {
        for (gacha_type, last_time) in gacha_type_and_last_time_mappings {
            self.pull_gacha_records(
                reqwest,
                fetcher,
                sender,
                uid,
                gacha_url,
                gacha_type,
                last_time.as_deref(),
            )
            .await?;
        }
        Ok(())
    }
}

pub async fn create_kuro_fetcher_channel<Record, FetcherChannel, F, Fut>(
    fetcher_channel: FetcherChannel,
    reqwest: Reqwest,
    fetcher: FetcherChannel::Fetcher,
    uid: String,
    gacha_url: String,
    gacha_type_and_last_time_mappings: BTreeMap<String, Option<String>>,
    receiver_fn: F,
) -> Result<()>
where
    Record: GachaRecord + Sized + Serialize + Send + Sync,
    FetcherChannel: KuroGachaRecordFetcherChannel<Record> + Send + Sync + 'static,
    F: Fn(KuroGachaRecordFetcherChannelFragment<Record>) -> Fut,
    Fut: Future<Output = Result<()>>,
{
    use tokio::spawn;
    use tokio::sync::mpsc::channel;

    let (sender, mut receiver) = channel(1);
    let task = spawn(async move {
        fetcher_channel
            .pull_all_gacha_records(
                &reqwest,
                &fetcher,
                &sender,
                &uid,
                &gacha_url,
                &gacha_type_and_last_time_mappings,
            )
            .await
    });

    while let Some(fragment) = receiver.recv().await {
        receiver_fn(fragment).await?;
    }

    task.await
        .map_err(|_| Error::GachaRecordFetcherChannelJoin)?
}

pub(super) async fn fetch_kuro_gacha_records<T: Sized + DeserializeOwned>(
    reqwest: &Reqwest,
    endpoint: &str,
    gacha_url: &str,
    gacha_type: Option<&str>,
) -> Result<GachaResponse<T>> {
    let endpoint_start = gacha_url.find(endpoint).ok_or(Error::IllegalGachaUrl)?;
    // let base_url = &gacha_url[0..endpoint_start + endpoint.len()];
    let base_url = "https://gmserver-api.aki-game2.net/gacha/record/query";
    let query_str = &gacha_url[endpoint_start + endpoint.len()..];

    let queries: HashMap<String, String> = form_urlencoded::parse(query_str.as_bytes())
        .into_owned()
        .collect();

    let resources_id = queries
        .get("resources_id")
        .cloned()
        .ok_or(Error::IllegalGachaUrl)?;
    let player_id = queries
        .get("player_id")
        .cloned()
        .ok_or(Error::IllegalGachaUrl)?;
    let record_id = queries
        .get("record_id")
        .cloned()
        .ok_or(Error::IllegalGachaUrl)?;
    let server_id = queries
        .get("svr_id")
        .cloned()
        .ok_or(Error::IllegalGachaUrl)?;
    let origin_gacha_type = queries
        .get("gacha_type")
        .cloned()
        .ok_or(Error::IllegalGachaUrl)?;
    let gacha_type = gacha_type.unwrap_or(&origin_gacha_type).to_string();
    let language_code = String::from("en");
    // Conversion as of 5/26/24
    // resources_id -> cardPoolId
    // gacha_type -> cardPoolType
    // player_id -> playerId
    // record_id -> recordId
    // svr_id -> serverId
    let mut data = HashMap::new();
    data.insert("cardPoolId", &resources_id);
    data.insert("cardPoolType", &gacha_type);
    data.insert("languageCode", &language_code);
    data.insert("playerId", &player_id);
    data.insert("recordId", &record_id);
    data.insert("serverId", &server_id);

    let url = Url::parse(base_url).map_err(|_| Error::IllegalGachaUrl)?;
    debug!("Fetch URL {}: {:?}", url, data);
    let response: GachaResponse<T> = reqwest.post(url).json(&data).send().await?.json().await?;
    let retcode = response.retcode.unwrap_or_default();
    if retcode != 0 {
        if retcode == -101 {
            Err(Error::TimeoutdGachaUrl)
        } else {
            Err(Error::GachaRecordRetcode {
                retcode,
                message: response.message,
            })
        }
    } else {
        Ok(response)
    }
}
