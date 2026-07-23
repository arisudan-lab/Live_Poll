#![no_std]
extern crate alloc;
use alloc::vec::Vec;
use soroban_sdk::{contractimpl, contracttype, Address, Env, IntoVal, Map, Symbol, Vec as SorobanVec, BytesN};

#[contracttype]
#[derive(Clone)]
pub struct EventRecord {
    pub source: Address,
    pub topic: Symbol,
    pub payload: Vec<u8>,
}

pub struct EventStreamContract;

#[contractimpl]
impl EventStreamContract {
    pub fn notify(e: Env, topic: Symbol, payload: Vec<u8>, source: Address) {
        // Publish a contract-level event
        e.events().publish((topic.clone(),), (source.clone(), payload.clone()));

        // store small history per topic (bounded)
        let key = (Symbol::short("history"), topic.clone());
        let mut map: Map<_, SorobanVec<EventRecord>> = e.storage().get(&key).unwrap_or_else(|| Map::new(&e));
        let mut vec = map.get(&Symbol::short("items")).unwrap_or_else(|| SorobanVec::new(&e));
        let rec = EventRecord { source, topic, payload };
        vec.push_back(rec);
        map.set(&Symbol::short("items"), &vec);
        e.storage().set(&key, &map);
    }

    pub fn get_events(e: Env, topic: Symbol, limit: u32) -> SorobanVec<EventRecord> {
        let key = (Symbol::short("history"), topic);
        let map: Map<_, SorobanVec<EventRecord>> = e.storage().get(&key).unwrap_or_else(|| Map::new(&e));
        let vec = map.get(&Symbol::short("items")).unwrap_or_else(|| SorobanVec::new(&e));
        let mut out = SorobanVec::new(&e);
        let l = core::cmp::min(limit, 100);
        let len = vec.len();
        let start = if len > l as usize { len - l as usize } else { 0 };
        for i in start..len {
            out.push_back(vec.get(i));
        }
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as TestAddress, Env, Symbol};

    #[test]
    fn test_notify_and_get_events() {
        let e = Env::default();
        let addr = Address::from(TestAddress::from_account_id(&e, &e.generate_account_id()));
        let topic = Symbol::short("poll");
        EventStreamContract::notify(e.clone(), topic.clone(), b"payload".to_vec(), addr.clone());
        let events = EventStreamContract::get_events(e.clone(), topic.clone(), 10);
        assert!(events.len() > 0);
    }
}
