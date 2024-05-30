extern crate sea_orm;

use crate::gacha::kuro::wutheringwaves::WutheringWavesGachaRecord;
use sea_orm::entity::prelude::*;
use sea_orm::ActiveValue;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "wutheringwaves_gacha_records")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: String,
    #[sea_orm(indexed)]
    pub uid: String,
    #[sea_orm(indexed)]
    pub gacha_type: String,
    pub card_pool_type: String,
    pub resource_id: i32,
    pub quality_level: i32,
    pub resource_type: String,
    pub name: String,
    pub count: i32,
    pub time: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

/// Convert

impl From<WutheringWavesGachaRecord> for ActiveModel {
    fn from(value: WutheringWavesGachaRecord) -> Self {
        Self {
            id: ActiveValue::set(value.id.unwrap_or_default()),
            uid: ActiveValue::set(value.uid.unwrap_or_default()),
            gacha_type: ActiveValue::set(value.gacha_type.unwrap_or_default()),
            card_pool_type: ActiveValue::set(value.card_pool_type),
            resource_id: ActiveValue::set(value.resource_id),
            quality_level: ActiveValue::set(value.quality_level),
            resource_type: ActiveValue::set(value.resource_type),
            name: ActiveValue::set(value.name),
            count: ActiveValue::set(value.count),
            time: ActiveValue::set(value.time),
        }
    }
}

impl From<Model> for WutheringWavesGachaRecord {
    fn from(value: Model) -> Self {
        Self {
            id: Some(value.id),
            uid: Some(value.uid),
            gacha_type: Some(value.gacha_type),
            card_pool_type: value.card_pool_type,
            resource_id: value.resource_id,
            quality_level: value.quality_level,
            resource_type: value.resource_type,
            name: value.name,
            count: value.count,
            time: value.time,
        }
    }
}
