use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::error::Result;
use std::{
    any::Any,
    path::{Path, PathBuf},
};

/// Game Directory
pub trait GameDataDirectoryFinder {
    fn find_game_data_directories(&self) -> Result<Vec<PathBuf>>;
}

/// Gacha Record
pub trait GachaRecord: Any {
    fn id(&self) -> &str;
    fn as_any(&self) -> &dyn Any;
}

impl dyn GachaRecord {
    #[allow(unused)]
    pub fn downcast_ref<T: GachaRecord>(&self) -> Option<&T> {
        self.as_any().downcast_ref::<T>()
    }
}

/// Gacha Url
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct GachaUrl {
    pub addr: Option<u32>,
    pub creation_time: OffsetDateTime,
    pub value: String,
}

impl std::ops::Deref for GachaUrl {
    type Target = String;

    fn deref(&self) -> &Self::Target {
        &self.value
    }
}

/// Gacha Url Finder
pub trait GachaUrlFinder {
    fn find_gacha_urls<P: AsRef<Path>>(&self, game_data_dir: P) -> Result<Vec<GachaUrl>>;
}
