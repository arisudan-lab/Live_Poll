#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec};

// ============================================================================
// Data Structures
// ============================================================================

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EventRecord {
    pub id: u32,
    pub event_type: Symbol,
    pub source: Address,
    pub poll_id: u32,
    pub ledger: u32,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum UserRole {
    Admin,
    Subscriber,
}

#[contracttype]
pub enum DataKey {
    // Event storage
    EventCount,
    Event(u32),
    CountByType(Symbol),
    
    // Access control
    Admin,
    Subscribers,
    
    // Configuration
    MaxEvents,
    PruningEnabled,
}

// ============================================================================
// Contract Definition
// ============================================================================

#[contract]
pub struct EventStreamContract;

#[contractimpl]
impl EventStreamContract {
    // ========================================================================
    // Initialization
    // ========================================================================
    
    /// Initialize the contract with an admin
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::MaxEvents, &10000u32);
        env.storage().instance().set(&DataKey::PruningEnabled, &true);
    }

    // ========================================================================
    // Core Event Functions
    // ========================================================================
    
    /// Notify the contract of a new event from live_poll
    pub fn notify(env: Env, topic: Symbol, source: Address, poll_id: u32) {
        source.require_auth();
        
        // Verify caller is the registered live_poll contract (optional security)
        // This can be enhanced with explicit contract verification
        
        // Increment total count
        let count: u32 = env.storage().instance().get(&DataKey::EventCount).unwrap_or(0);
        let next_id = count + 1;
        
        // Create event record
        let event = EventRecord {
            id: next_id,
            event_type: topic.clone(),
            source: source.clone(),
            poll_id,
            ledger: env.ledger().sequence(),
            timestamp: env.ledger().timestamp(),
        };
        
        // Store event
        env.storage().instance().set(&DataKey::EventCount, &next_id);
        env.storage().persistent().set(&DataKey::Event(next_id), &event);
        
        // Increment type-specific count
        let type_key = DataKey::CountByType(topic.clone());
        let type_count: u32 = env.storage().instance().get(&type_key).unwrap_or(0);
        env.storage().instance().set(&type_key, &(type_count + 1));
        
        // Extend TTL for persistence
        env.storage().instance().extend_ttl(100000, 200000);
        env.storage().persistent().extend_ttl(&DataKey::Event(next_id), 100000, 200000);
        
        // Emit event for external listeners
        env.events().publish(
            (topic.clone(), poll_id),
            (source.clone(), next_id, env.ledger().sequence()),
        );
        
        // Auto-prune if enabled and over limit
        let max_events: u32 = env.storage().instance().get(&DataKey::MaxEvents).unwrap_or(10000);
        let pruning_enabled: bool = env.storage().instance().get(&DataKey::PruningEnabled).unwrap_or(true);
        
        if pruning_enabled && next_id > max_events {
            Self::prune_old_events(&env, next_id - max_events);
        }
    }

    // ========================================================================
    // Read Functions
    // ========================================================================
    
    /// Get total event count
    pub fn get_event_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::EventCount).unwrap_or(0)
    }
    
    /// Get count by event type
    pub fn get_event_count_by_type(env: Env, topic: Symbol) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::CountByType(topic))
            .unwrap_or(0)
    }
    
    /// Get a specific event by ID
    pub fn get_event(env: Env, event_id: u32) -> EventRecord {
        env.storage()
            .persistent()
            .get(&DataKey::Event(event_id))
            .unwrap_or_else(|| panic!("Event not found"))
    }
    
    /// Get paginated events (newest first)
    pub fn get_events(env: Env, start: u32, limit: u32) -> Vec<EventRecord> {
        let count = Self::get_event_count(env.clone());
        let mut results = Vec::new(&env);
        
        if count == 0 {
            return results;
        }
        
        let mut current_id = if start == 0 {
            count
        } else {
            count.saturating_sub(start)
        };
        
        let mut fetched = 0;
        let max_limit = limit.min(100);
        
        while current_id > 0 && fetched < max_limit {
            if let Some(event) = env.storage().persistent().get(&DataKey::Event(current_id)) {
                results.push_back(event);
                fetched += 1;
            }
            current_id -= 1;
        }
        
        results
    }
    
    /// Get events by type (paginated)
    pub fn get_events_by_type(env: Env, topic: Symbol, start: u32, limit: u32) -> Vec<EventRecord> {
        let count = Self::get_event_count_by_type(env.clone(), topic.clone());
        let mut results = Vec::new(&env);
        
        if count == 0 {
            return results;
        }
        
        // This is a simplified implementation - in production you'd want an index
        let total_events = Self::get_event_count(env.clone());
        let mut fetched = 0;
        let mut current_id = total_events;
        let max_limit = limit.min(100);

        while current_id > 0 && fetched < max_limit {
            if let Some(event) = env.storage().persistent().get::<DataKey, EventRecord>(&DataKey::Event(current_id)) {
                if event.event_type == topic {
                    if fetched >= start {
                        results.push_back(event);
                    }
                    fetched += 1;
                }
            }
            current_id -= 1;
        }
        
        results
    }

    // ========================================================================
    // Admin Functions
    // ========================================================================
    
    /// Update max events before pruning
    pub fn set_max_events(env: Env, caller: Address, max: u32) {
        caller.require_auth();
        Self::verify_admin(&env, &caller);
        
        if max < 100 {
            panic!("Max events must be at least 100");
        }
        
        env.storage().instance().set(&DataKey::MaxEvents, &max);
        
        env.events().publish(
            (symbol_short!("max_upd"), caller),
            max,
        );
    }
    
    /// Toggle pruning
    pub fn toggle_pruning(env: Env, caller: Address, enabled: bool) {
        caller.require_auth();
        Self::verify_admin(&env, &caller);
        
        env.storage().instance().set(&DataKey::PruningEnabled, &enabled);
        
        env.events().publish(
            (symbol_short!("prune_tgl"), caller),
            enabled,
        );
    }
    
    /// Manually prune old events
    pub fn prune_events(env: Env, caller: Address, keep_count: u32) {
        caller.require_auth();
        Self::verify_admin(&env, &caller);
        
        let count = Self::get_event_count(env.clone());
        if count <= keep_count {
            return; // Nothing to prune
        }
        
        let to_remove = count - keep_count;
        Self::prune_old_events(&env, to_remove);
        
        env.events().publish(
            (symbol_short!("prune_exe"), caller),
            to_remove,
        );
    }

    // ========================================================================
    // Helper Functions
    // ========================================================================
    
    fn verify_admin(env: &Env, addr: &Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        
        if *addr != admin {
            panic!("Caller is not admin");
        }
    }
    
    fn prune_old_events(env: &Env, count: u32) {
        // Remove oldest events up to count
        for i in 1..=count {
            env.storage().persistent().remove(&DataKey::Event(i));
        }
        
        // Note: In production, you'd want to update indices and counts
        // This is a simplified implementation
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn test_initialize() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, EventStreamContract);
        let client = EventStreamContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        assert_eq!(client.get_event_count(), 0);
    }

    #[test]
    fn test_notify_and_get_event_count() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, EventStreamContract);
        let client = EventStreamContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let addr = Address::generate(&e);
        let topic = symbol_short!("poll");

        client.notify(&topic, &addr, &1);
        client.notify(&topic, &addr, &2);
        client.notify(&topic, &addr, &3);

        assert_eq!(client.get_event_count(), 3);
        assert_eq!(client.get_event_count_by_type(&topic), 3);
    }

    #[test]
    fn test_get_event() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, EventStreamContract);
        let client = EventStreamContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let addr = Address::generate(&e);
        let topic = symbol_short!("vote");

        client.notify(&topic, &addr, &1);

        let event = client.get_event(&1);
        assert_eq!(event.id, 1);
        assert_eq!(event.event_type, topic);
        assert_eq!(event.poll_id, 1);
    }

    #[test]
    fn test_get_events_pagination() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, EventStreamContract);
        let client = EventStreamContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let addr = Address::generate(&e);
        let topic = symbol_short!("poll");

        // Create 10 events
        for i in 1..=10 {
            client.notify(&topic, &addr, &i);
        }

        // Get first 5 (newest)
        let events = client.get_events(&0, &5);
        assert_eq!(events.len(), 5);
        assert_eq!(events.get(0).unwrap().id, 10);
        assert_eq!(events.get(4).unwrap().id, 6);

        // Get next 5
        let events = client.get_events(&5, &5);
        assert_eq!(events.len(), 5);
        assert_eq!(events.get(0).unwrap().id, 5);
        assert_eq!(events.get(4).unwrap().id, 1);
    }

    #[test]
    fn test_get_events_by_type() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, EventStreamContract);
        let client = EventStreamContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let addr = Address::generate(&e);
        let topic_poll = symbol_short!("poll");
        let topic_vote = symbol_short!("vote");

        // Create mixed events
        client.notify(&topic_poll, &addr, &1);
        client.notify(&topic_vote, &addr, &1);
        client.notify(&topic_poll, &addr, &2);
        client.notify(&topic_vote, &addr, &2);
        client.notify(&topic_poll, &addr, &3);

        // Get only poll events
        let poll_events = client.get_events_by_type(&topic_poll, &0, &10);
        assert_eq!(poll_events.len(), 3);

        // Get only vote events
        let vote_events = client.get_events_by_type(&topic_vote, &0, &10);
        assert_eq!(vote_events.len(), 2);
    }

    #[test]
    fn test_admin_functions() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, EventStreamContract);
        let client = EventStreamContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        // Set max events
        client.set_max_events(&admin, &5000);
        
        // Toggle pruning
        client.toggle_pruning(&admin, &false);
    }
}
