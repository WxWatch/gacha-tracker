use std::collections::hash_map::Entry;

use serde::Serialize;
use time::OffsetDateTime;
use tracing::debug;

use crate::{
    error::{Error, Result},
    gacha::{
        utilities::{create_default_reqwest, GACHA_URL_CACHED},
        GachaRecord, GachaUrl,
    },
    storage::entity_account::AccountFacet,
};

use super::kuro::KuroGachaRecordFetcher;

pub(crate) async fn find_kuro_gacha_url_and_validate_consistency<Record, Fetcher>(
    fetcher: &Fetcher,
    facet: &AccountFacet,
    uid: &str,
    gacha_urls: &[GachaUrl],
) -> Result<GachaUrl>
where
    Record: GachaRecord + Sized + Serialize + Send + Sync,
    Fetcher: KuroGachaRecordFetcher<Target = Record>,
{
    debug!(
        "Find gacha url and validate consistency: facet={}, uid={}",
        facet, uid
    );
    let mut cached = GACHA_URL_CACHED.lock().await;

    let reqwest = create_default_reqwest()?;
    let local_datetime = OffsetDateTime::now_local().map_err(time::Error::from)?;
    let valid_gacha_urls: Vec<&GachaUrl> = gacha_urls.iter().collect();

    debug!("Local datetime: {}", local_datetime);
    debug!("Total gacha urls: {}", valid_gacha_urls.len());

    fn combine_key(facet: &AccountFacet, uid: &str) -> String {
        format!("{}-{}", facet, uid)
    }

    if let Some((counter, gacha_url)) = valid_gacha_urls.into_iter().enumerate().last() {
        let key = combine_key(facet, uid);
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

        return Ok(gacha_url.clone());
    }

    Err(Error::VacantGachaUrl)
}
