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
        env.events()
            .publish((topic.clone(), poll_id), source.clone());

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
    use soroban_sdk::Env;

    #[test]
    fn test_notify_and_get_event_count() {
        let e = Env::default();
        let contract_id = e.register_contract(None, EventStreamContract);
        let client = EventStreamContractClient::new(&e, &contract_id);

        let addr = Address::generate(&e);
        let topic = symbol_short!("poll");

        client.notify(&topic, &addr, &1);
        client.notify(&topic, &addr, &2);

        let count = client.get_event_count(&topic);
        assert_eq!(count, 2);
    }
}
