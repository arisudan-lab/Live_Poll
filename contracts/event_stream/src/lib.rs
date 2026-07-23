#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Count(Symbol),
}

#[contract]
pub struct EventStreamContract;

#[contractimpl]
impl EventStreamContract {
    pub fn notify(env: Env, topic: Symbol, source: Address, poll_id: u32) {
        env.events().publish((topic.clone(), poll_id), source.clone());

        let key = DataKey::Count(topic);
        let current: u32 = env.storage().instance().get(&key).unwrap_or(0);
        env.storage().instance().set(&key, &(current + 1));
    }

    pub fn get_event_count(env: Env, topic: Symbol) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Count(topic))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as TestAddress, Env};

    #[test]
    fn test_notify_and_get_event_count() {
        let e = Env::default();
        let addr = Address::from(TestAddress::from_account_id(&e, &e.generate_account_id()));
        let topic = symbol_short!("poll");

        EventStreamContract::notify(e.clone(), topic.clone(), addr.clone(), 1);
        EventStreamContract::notify(e.clone(), topic.clone(), addr.clone(), 2);

        let count = EventStreamContract::get_event_count(e.clone(), topic.clone());
        assert_eq!(count, 2);
    }
}
