extern crate anyhow;
extern crate futures;
extern crate sea_orm;
extern crate tracing;

use super::entity_genshin_gacha_record::{
    ActiveModel as GenshinGachaRecordActiveModel, Column as GenshinGachaRecordColumn,
    Entity as GenshinGachaRecordEntity,
};
use super::entity_genshin_gacha_record_legacy::{
    Entity as GenshinGachaRecordLegacyEntity, Model as GenshinGachaRecordLegacyModel,
};
use super::Storage;
use futures::TryStreamExt;
use sea_orm::entity::ActiveValue;
use sea_orm::sea_query::OnConflict;
use sea_orm::{ConnectOptions, Database, EntityTrait, TransactionTrait};
use std::path::Path;
use tracing::debug;

#[allow(unused)]
pub async fn legacy_migration<P: AsRef<Path>>(
    legacy_database: P,
    destination_database: P,
) -> anyhow::Result<()> {
    debug!("Starting legacy migration...");
    debug!("Legacy database: {:?}", legacy_database.as_ref());
    debug!("Destination database: {:?}", destination_database.as_ref());

    let legacy_database = {
        let url = format!("sqlite://{}?mode=ro", legacy_database.as_ref().display());
        debug!("Connecting to legacy database: {}", url);
        let mut opts = ConnectOptions::new(url);
        opts.sqlx_logging_level(tracing::log::LevelFilter::Trace);
        Database::connect(opts).await?
    };

    let destination = Storage::new_with_database_file(destination_database.as_ref()).await?;
    destination.initialize().await?;

    debug!("Transaction started...");
    let txn = destination.database.begin().await?;

    debug!("Finding legacy genshin records...");
    let mut stream = GenshinGachaRecordLegacyEntity::find()
        .stream(&legacy_database)
        .await?;

    let mut count = 0;
    while let Some(legacy) = stream.try_next().await? {
        let model = GenshinGachaRecordActiveModel::from(legacy);
        GenshinGachaRecordEntity::insert(model)
            .on_conflict(
                OnConflict::column(GenshinGachaRecordColumn::Id)
                    .do_nothing()
                    .to_owned(),
            )
            .exec_without_returning(&txn)
            .await?;

        count += 1;
    }

    debug!("Total legacy genshin records: {}", count);
    debug!("Transaction commit...");
    txn.commit().await?;

    debug!("Completed legacy migration");
    Ok(())
}

// Convert Genshin legacy model to active model

const GENSHIN_ITEM_TYPE_CHARACTER: &str = "character";
const GENSHIN_ITEM_TYPE_WEAPON: &str = "weapon";

impl From<GenshinGachaRecordLegacyModel> for GenshinGachaRecordActiveModel {
    fn from(value: GenshinGachaRecordLegacyModel) -> Self {
        let item_type = if value.item_type == 0 {
            GENSHIN_ITEM_TYPE_CHARACTER
        } else {
            GENSHIN_ITEM_TYPE_WEAPON
        };
        Self {
            id: ActiveValue::Set(value.id),
            uid: ActiveValue::Set(value.uid.to_string()),
            gacha_type: ActiveValue::Set(value.gacha_type.to_string()),
            item_id: ActiveValue::Set(value.item_id),
            count: ActiveValue::Set(value.count),
            time: ActiveValue::Set(value.time),
            name: ActiveValue::Set(value.name),
            lang: ActiveValue::Set(value.lang),
            item_type: ActiveValue::Set(item_type.to_owned()),
            rank_type: ActiveValue::Set(value.rank_type),
        }
    }
}
