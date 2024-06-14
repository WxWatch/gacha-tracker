extern crate async_trait;
extern crate form_urlencoded;
extern crate reqwest;
extern crate serde;
extern crate time;
extern crate tokio;
extern crate url;

use crate::error::{Error, Result};
use crate::gacha::GachaRecord;
use async_trait::async_trait;
use reqwest::Client as Reqwest;
use serde::Serialize;
use std::collections::BTreeMap;
use std::future::Future;

/// Gacha Record Fetcher
#[async_trait]
pub trait HoyoverseGachaRecordFetcher {
    type Target: GachaRecord;

    async fn fetch_gacha_records(
        &self,
        reqwest: &Reqwest,
        gacha_url: &str,
        gacha_type: Option<&str>,
        end_id: Option<&str>,
    ) -> Result<Option<Vec<Self::Target>>>;

    async fn fetch_gacha_records_any_uid(
        &self,
        reqwest: &Reqwest,
        gacha_url: &str,
    ) -> Result<Option<String>>;
}

/// Gacha Record Fetcher Channel

#[allow(unused)]
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum GachaRecordFetcherChannelFragment<T: GachaRecord + Sized + Serialize + Send + Sync> {
    Sleeping,
    Ready(String),
    Pagination(u32),
    Data(Vec<T>),
    Finished,
}

#[async_trait]
pub trait GachaRecordFetcherChannel<T: GachaRecord + Sized + Serialize + Send + Sync> {
    type Fetcher: HoyoverseGachaRecordFetcher<Target = T> + Send + Sync;

    async fn pull_gacha_records(
        &self,
        reqwest: &Reqwest,
        fetcher: &Self::Fetcher,
        sender: &tokio::sync::mpsc::Sender<GachaRecordFetcherChannelFragment<T>>,
        gacha_url: &str,
        gacha_type: &str,
        last_end_id: Option<&str>,
    ) -> Result<()> {
        const SLEEPING: u64 = 3;

        sender
            .send(GachaRecordFetcherChannelFragment::Ready(
                gacha_type.to_owned(),
            ))
            .await
            .map_err(|_| Error::GachaRecordFetcherChannelSend)?;
        tokio::time::sleep(tokio::time::Duration::from_secs(SLEEPING)).await;

        let mut end_id = String::from("0");
        let mut pagination: u32 = 1;

        loop {
            if pagination % 5 == 0 {
                sender
                    .send(GachaRecordFetcherChannelFragment::Sleeping)
                    .await
                    .map_err(|_| Error::GachaRecordFetcherChannelSend)?;
                tokio::time::sleep(tokio::time::Duration::from_secs(SLEEPING)).await;
            }

            sender
                .send(GachaRecordFetcherChannelFragment::Pagination(pagination))
                .await
                .map_err(|_| Error::GachaRecordFetcherChannelSend)?;
            let gacha_records = fetcher
                .fetch_gacha_records(reqwest, gacha_url, Some(gacha_type), Some(&end_id))
                .await?;
            pagination += 1;

            if let Some(gacha_records) = gacha_records {
                if !gacha_records.is_empty() {
                    end_id = gacha_records.last().unwrap().id().to_owned();

                    let mut should_break = false;
                    let data = if let Some(last) = last_end_id {
                        let mut tmp = Vec::with_capacity(gacha_records.len());
                        for record in gacha_records {
                            if last.cmp(record.id()).is_lt() {
                                tmp.push(record);
                            } else {
                                should_break = true;
                            }
                        }
                        tmp
                    } else {
                        gacha_records
                    };

                    sender
                        .send(GachaRecordFetcherChannelFragment::Data(data))
                        .await
                        .map_err(|_| Error::GachaRecordFetcherChannelSend)?;

                    if should_break {
                        break;
                    } else {
                        tokio::time::sleep(tokio::time::Duration::from_secs(SLEEPING)).await;
                        continue;
                    }
                }
            }

            break;
        }

        sender
            .send(GachaRecordFetcherChannelFragment::Finished)
            .await
            .map_err(|_| Error::GachaRecordFetcherChannelSend)?;
        Ok(())
    }

    async fn pull_all_gacha_records(
        &self,
        reqwest: &Reqwest,
        fetcher: &Self::Fetcher,
        sender: &tokio::sync::mpsc::Sender<GachaRecordFetcherChannelFragment<T>>,
        gacha_url: &str,
        gacha_type_and_last_end_id_mappings: &BTreeMap<String, Option<String>>,
    ) -> Result<()> {
        for (gacha_type, last_end_id) in gacha_type_and_last_end_id_mappings {
            self.pull_gacha_records(
                reqwest,
                fetcher,
                sender,
                gacha_url,
                gacha_type,
                last_end_id.as_deref(),
            )
            .await?;
        }
        Ok(())
    }
}

pub async fn create_fetcher_channel<Record, FetcherChannel, F, Fut>(
    fetcher_channel: FetcherChannel,
    reqwest: Reqwest,
    fetcher: FetcherChannel::Fetcher,
    gacha_url: String,
    gacha_type_and_last_end_id_mappings: BTreeMap<String, Option<String>>,
    receiver_fn: F,
) -> Result<()>
where
    Record: GachaRecord + Sized + Serialize + Send + Sync,
    FetcherChannel: GachaRecordFetcherChannel<Record> + Send + Sync + 'static,
    F: Fn(GachaRecordFetcherChannelFragment<Record>) -> Fut,
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
                &gacha_url,
                &gacha_type_and_last_end_id_mappings,
            )
            .await
    });

    while let Some(fragment) = receiver.recv().await {
        receiver_fn(fragment).await?;
    }

    task.await
        .map_err(|_| Error::GachaRecordFetcherChannelJoin)?
}
