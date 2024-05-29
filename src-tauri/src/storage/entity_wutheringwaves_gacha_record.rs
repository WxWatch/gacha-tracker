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
    pub cardPoolType: String,
    pub resourceId: i32,
    pub qualityLevel: i32,
    pub resourceType: String,
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
            cardPoolType: ActiveValue::set(value.cardPoolType),
            resourceId: ActiveValue::set(value.resourceId),
            qualityLevel: ActiveValue::set(value.qualityLevel),
            resourceType: ActiveValue::set(value.resourceType),
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
            cardPoolType: value.cardPoolType,
            resourceId: value.resourceId,
            qualityLevel: value.qualityLevel,
            resourceType: value.resourceType,
            name: value.name,
            count: value.count,
            time: value.time,
        }
    }
}
