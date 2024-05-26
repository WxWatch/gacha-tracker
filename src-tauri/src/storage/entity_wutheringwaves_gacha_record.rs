extern crate sea_orm;

use crate::gacha::WutheringWavesGachaRecord;
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
    pub gacha_id: String,
    #[sea_orm(indexed)]
    pub gacha_type: String,
    pub cardPoolType: String,
    pub resourceId: i8,
    pub qualityLevel: i8,
    pub resourceType: String,
    pub name: String,
    pub count: i8,
    pub time: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

/// Convert

impl From<WutheringWavesGachaRecord> for ActiveModel {
    fn from(value: WutheringWavesGachaRecord) -> Self {
        Self {
            id: ActiveValue::set(value.id),
            uid: ActiveValue::set(value.uid),
            gacha_id: ActiveValue::set(value.gacha_id),
            gacha_type: ActiveValue::set(value.gacha_type),
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
            id: value.id,
            uid: value.uid,
            gacha_id: value.gacha_id,
            gacha_type: value.gacha_type,
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
