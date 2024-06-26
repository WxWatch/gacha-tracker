use std::borrow::Cow;
use std::collections::HashMap;

use paste::paste;
use serde::Deserialize;

use crate::{
    gacha::dict::{Category, GachaDictionary, GachaDictionaryEntry},
    storage::entity_account::AccountFacet,
};

fn read_dictionaries<'a>(
    lang: &'a str,
    bytes: &'a [u8],
) -> Result<HashMap<Cow<'a, str>, GachaDictionaryEntry<'a>>, serde_json::Error> {
    // {
    //   "category": "character",
    //   "category_name": "角色",
    //   "entries": {
    //     "神里绫华": ["10000002", 5]
    //   }
    // }
    // {
    //   "category": "weapon",
    //   "category_name": "武器",
    //   "entries": {
    //     "雾切之回光": ["11509", 5]
    //   }
    // }
    #[derive(Deserialize)]
    struct DictionaryObject<'a> {
        category: Category,
        category_name: &'a str,
        entries: HashMap<Cow<'a, str>, (&'a str, u8)>,
    }

    let objects: Vec<DictionaryObject> = serde_json::from_slice(bytes)?;

    let total = objects.iter().map(|object| object.entries.len()).sum();
    let mut entries = HashMap::with_capacity(total);

    for object in objects {
        #[cfg(debug_assertions)]
        debug_assert!(!object.category_name.is_empty());

        for (item_name, (item_id, rank_type)) in object.entries {
            #[cfg(debug_assertions)]
            debug_assert!(!item_name.is_empty());

            entries.insert(
                item_name.clone(),
                GachaDictionaryEntry {
                    lang,
                    category: object.category.clone(),
                    category_name: object.category_name,
                    item_name,
                    item_id,
                    rank_type,
                },
            );
        }
    }

    Ok(entries)
}

macro_rules! embedded {
  ($(
    $embedded:ident {
      $facet:ident,
      $(
        $field:ident = $lang:literal -> $file:expr
      ),*
    }
  ),*) => {
    paste! {
      $(
        pub mod $embedded {
          use once_cell::sync::Lazy;

          use crate::storage::entity_account::AccountFacet;
          use crate::gacha::dict::GachaDictionary;
          use crate::gacha::dict::embedded::read_dictionaries;

          pub const FACET: &'static AccountFacet = &AccountFacet::$facet;

          $(
            pub static [<LANG_ $field>]: Lazy<GachaDictionary> = Lazy::new(|| {
              let entries = match read_dictionaries($lang, &include_bytes!($file)[..]) {
                Ok(v) => v,
                Err(error) => {
                  panic!("Embedded dictionary file '{}' serialization error on read: {error}", $file)
                }
              };

              GachaDictionary::new(entries)
            });
          )*

          /// `cfg(test)`: Dereference, triggering lazy load
          #[cfg(test)]
          pub fn validation_lazy_read() {
            $(
              let _ = *[<LANG_ $field>];
            )*
          }
        }
      )*

      pub fn dictionary(
        facet: &AccountFacet,
        lang: &str
      ) -> Option<&'static GachaDictionary<'static>> {
        match facet {
          $(
            $embedded::FACET => {
              match lang {
                $($lang => Some(&$embedded::[<LANG_ $field>]),)*
                _ => None
              }
            },
          )*
        }
      }
    }
  };
}

embedded!(
  genshin_impact {
    Genshin,
    EN_US  = "en-us" -> "./en-us.json"
  },
  star_rail {
    StarRail,
    EN_US = "en-us" -> "./en-us.json"
  },
  wuthering_waves {
    WutheringWaves,
    EN_US = "en-us" -> "./en-us.json"
  }
);

pub fn name(
    facet: &AccountFacet,
    lang: &str,
    item_name: &str,
) -> Option<&'static GachaDictionaryEntry<'static>> {
    dictionary(facet, lang).and_then(|dictionary| dictionary.name(item_name))
}

pub fn id(
    facet: &AccountFacet,
    lang: &str,
    item_id: &str,
) -> Option<&'static GachaDictionaryEntry<'static>> {
    dictionary(facet, lang).and_then(|dictionary| dictionary.id(item_id))
}
