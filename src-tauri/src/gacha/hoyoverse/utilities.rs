use std::{
    collections::{hash_map::Entry, HashMap},
    path::{Path, PathBuf},
};

use reqwest::Client as Reqwest;
use serde::{de::DeserializeOwned, Serialize};
use time::OffsetDateTime;
use tracing::debug;
use url::Url;

use crate::{
    error::{Error, Result},
    gacha::{
        utilities::{create_default_reqwest, GachaResponse, GACHA_URL_CACHED},
        GachaRecord, GachaUrl,
    },
    storage::entity_account::AccountFacet,
};

use super::hoyoverse::HoyoverseGachaRecordFetcher;

pub(super) fn lookup_cognosphere_dir() -> PathBuf {
    if cfg!(windows) {
        const VAR: &str = "USERPROFILE";
        const SUBDIR: &str = "AppData/LocalLow/Cognosphere";
        let user_profile = std::env::var(VAR).unwrap();
        Path::new(&user_profile).join(SUBDIR)
    } else {
        // TODO: Other platforms
        todo!()
    }
}

pub(super) fn lookup_mihoyo_dir() -> PathBuf {
    if cfg!(windows) {
        const VAR: &str = "USERPROFILE";
        const SUBDIR: &str = "AppData/LocalLow/miHoYo";
        let user_profile = std::env::var(VAR).unwrap();
        Path::new(&user_profile).join(SUBDIR)
    } else {
        // TODO: Other platforms
        todo!()
    }
}

pub(super) async fn fetch_gacha_records<T: Sized + DeserializeOwned>(
    reqwest: &Reqwest,
    endpoint: &str,
    gacha_url: &str,
    gacha_type: Option<&str>,
    end_id: Option<&str>,
) -> Result<GachaResponse<T>> {
    let endpoint_start = gacha_url.find(endpoint).ok_or(Error::IllegalGachaUrl)?;
    let base_url = &gacha_url[0..endpoint_start + endpoint.len()];
    let query_str = &gacha_url[endpoint_start + endpoint.len()..];

    let mut queries: HashMap<String, String> = form_urlencoded::parse(query_str.as_bytes())
        .into_owned()
        .collect();

    let origin_gacha_type = queries
        .get("gacha_type")
        .cloned()
        .ok_or(Error::IllegalGachaUrl)?;
    let origin_end_id = queries.get("end_id").cloned();
    let gacha_type = gacha_type.unwrap_or(&origin_gacha_type);

    queries.remove("gacha_type");
    queries.remove("page");
    queries.remove("size");
    queries.remove("begin_id");
    queries.remove("end_id");

    let mut url = Url::parse_with_params(base_url, queries).map_err(|_| Error::IllegalGachaUrl)?;

    url.query_pairs_mut()
        .append_pair("page", "1")
        .append_pair("size", "20")
        .append_pair("gacha_type", gacha_type);

    if let Some(end_id) = end_id.or(origin_end_id.as_deref()) {
        url.query_pairs_mut().append_pair("end_id", end_id);
    }

    let response: GachaResponse<T> = reqwest.get(url).send().await?.json().await?;
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

pub async fn find_hoyoverse_gacha_url_and_validate_consistency<Record, Fetcher>(
    fetcher: &Fetcher,
    facet: &AccountFacet,
    uid: &str,
    gacha_urls: &[GachaUrl],
) -> Result<GachaUrl>
where
    Record: GachaRecord + Sized + Serialize + Send + Sync,
    Fetcher: HoyoverseGachaRecordFetcher<Target = Record>,
{
    debug!(
        "Find gacha url and validate consistency: facet={}, uid={}",
        facet, uid
    );
    let mut cached = GACHA_URL_CACHED.lock().await;

    let reqwest = create_default_reqwest()?;
    let local_datetime = OffsetDateTime::now_local().map_err(time::Error::from)?;
    let valid_gacha_urls: Vec<&GachaUrl> = gacha_urls
        .iter()
        .filter(|item| item.creation_time + time::Duration::DAY > local_datetime)
        .collect();

    debug!("Local datetime: {}", local_datetime);
    debug!("Total gacha urls: {}", valid_gacha_urls.len());

    fn combine_key(facet: &AccountFacet, uid: &str, gacha_url: &GachaUrl) -> String {
        format!("{}-{}-{}", facet, uid, gacha_url.addr.unwrap_or_default())
    }

    for (counter, gacha_url) in valid_gacha_urls.into_iter().enumerate() {
        let key = combine_key(facet, uid, gacha_url);
        debug!("Validate gacha url with key: {}", key);

        // Hit cache
        if let Entry::Occupied(entry) = cached.entry(key.to_owned()) {
            let value = entry.get();
            if value.creation_time + time::Duration::DAY > local_datetime {
                debug!(
                    "Hit gacha url cache: key={}, creation_time={}",
                    entry.key(),
                    value.creation_time
                );
                return Ok(value.clone());
            } else {
                debug!("Remove expired gacha url cache: key={}", entry.key());
                entry.remove_entry();
            }
        }

        // Else validate consistency
        if counter != 0 && counter % 5 == 0 {
            debug!("Sleep 3 seconds");
            tokio::time::sleep(std::time::Duration::from_secs(3)).await;
        }

        let result = fetcher
            .fetch_gacha_records_any_uid(&reqwest, gacha_url)
            .await;
        match result {
            Err(Error::GachaRecordRetcode { retcode, message }) => {
                // TODO: always retcode = -101 authkey timeout?
                debug!(
                    "Gacha record retcode: retcode={}, message={}",
                    retcode, message
                );
                return Err(Error::VacantGachaUrl);
            }
            Err(err) => return Err(err),
            Ok(gacha_url_uid) => {
                // Always cache the result
                if let Some(gacha_url_uid) = gacha_url_uid.as_deref() {
                    let key = combine_key(facet, gacha_url_uid, gacha_url);
                    debug!("Cache gacha url: key={}, url={}", key, gacha_url.value);
                    cached.insert(key.to_owned(), gacha_url.clone());
                }

                // Consistency check
                if gacha_url_uid.as_deref() == Some(uid) {
                    return Ok(gacha_url.clone());
                } else {
                    debug!(
                        "Gacha url uid mismatch: expected={}, actual={}",
                        uid,
                        gacha_url_uid.unwrap_or_default()
                    );
                    continue;
                }
            }
        }
    }

    Err(Error::VacantGachaUrl)
}
