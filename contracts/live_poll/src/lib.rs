#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, IntoVal, String, Symbol, Val, Vec,
};

// ============================================================================
// Data Structures
// ============================================================================

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PollOption {
    pub label: String,
    pub vote_count: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PollStatus {
    Active,
    Closed,
    Ended,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Poll {
    pub id: u32,
    pub creator: Address,
    pub title: String,
    pub description: String,
    pub options: Vec<PollOption>,
    pub total_votes: u32,
    pub status: PollStatus,
    pub created_at: u64,
    pub end_time: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum UserRole {
    Admin,
    Moderator,
    User,
}

#[contracttype]
pub enum DataKey {
    // Poll storage
    PollCount,
    Poll(u32),
    Voter(u32, Address),
    
    // Access control
    Admin,
    Moderators,
    UserRoles(Address),
    
    // Contract management
    EventContract,
    UpgradeContract,
    
    // Contract metadata
    Version,
    Paused,
}

// ============================================================================
// Contract Definition
// ============================================================================

#[contract]
pub struct LivePollContract;

#[contractimpl]
impl LivePollContract {
    // ========================================================================
    // Constructor & Initialization
    // ========================================================================
    
    /// Initialize the contract with an admin address
    pub fn initialize(env: Env, admin: Address) {
        // Only allow initialization once
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Version, &String::from_str(&env, "1.0.0"));
        env.storage().instance().set(&DataKey::Paused, &false);
    }

    // ========================================================================
    // Admin & Access Control Functions
    // ========================================================================
    
    /// Transfer ownership to a new admin
    pub fn transfer_ownership(env: Env, caller: Address, new_admin: Address) {
        caller.require_auth();
        
        let current_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        
        if caller != current_admin {
            panic!("Only current admin can transfer ownership");
        }
        
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        
        // Emit ownership transfer event
        env.events().publish(
            (Symbol::new(&env, "ownership_transferred"), caller.clone()),
            new_admin.clone(),
        );
    }
    
    /// Add a moderator (can create polls on behalf of users)
    pub fn add_moderator(env: Env, caller: Address, moderator: Address) {
        caller.require_auth();
        Self::verify_admin(&env, &caller);
        
        let mut moderators: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Moderators)
            .unwrap_or_else(|| Vec::new(&env));
        
        moderators.push_back(moderator.clone());
        env.storage().instance().set(&DataKey::Moderators, &moderators);
        
        env.storage().instance().set(&DataKey::UserRoles(moderator.clone()), &UserRole::Moderator);
        
        env.events().publish(
            (Symbol::new(&env, "moderator_added"), caller),
            moderator,
        );
    }
    
    /// Remove a moderator
    pub fn remove_moderator(env: Env, caller: Address, moderator: Address) {
        caller.require_auth();
        Self::verify_admin(&env, &caller);
        
        let moderators: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Moderators)
            .unwrap_or_else(|| Vec::new(&env));
        
        let mut new_moderators = Vec::new(&env);
        for mod_addr in moderators.iter() {
            if mod_addr != moderator {
                new_moderators.push_back(mod_addr);
            }
        }
        
        env.storage().instance().set(&DataKey::Moderators, &new_moderators);
        env.storage().instance().set(&DataKey::UserRoles(moderator.clone()), &UserRole::User);
        
        env.events().publish(
            (Symbol::new(&env, "moderator_removed"), caller),
            moderator,
        );
    }
    
    /// Pause contract operations (emergency stop)
    pub fn pause(env: Env, caller: Address) {
        caller.require_auth();
        Self::verify_admin(&env, &caller);
        
        env.storage().instance().set(&DataKey::Paused, &true);
        
        env.events().publish(
            (Symbol::new(&env, "contract_paused"), caller),
            (),
        );
    }
    
    /// Unpause contract operations
    pub fn unpause(env: Env, caller: Address) {
        caller.require_auth();
        Self::verify_admin(&env, &caller);
        
        env.storage().instance().set(&DataKey::Paused, &false);
        
        env.events().publish(
            (Symbol::new(&env, "contract_unpaused"), caller),
            (),
        );
    }
    
    /// Check if contract is paused
    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
    }

    // ========================================================================
    // Core Poll Functions
    // ========================================================================
    
    /// Create a new poll with validation
    pub fn create_poll(
        env: Env,
        creator: Address,
        title: String,
        description: String,
        options_labels: Vec<String>,
        end_time: u64,
    ) -> u32 {
        creator.require_auth();
        
        // Check if contract is paused
        if Self::is_paused(env.clone()) {
            panic!("Contract operations are paused");
        }
        
        // Validate inputs
        Self::validate_poll_input(&env, &title, &description, &options_labels);
        
        // Build options
        let mut options = Vec::new(&env);
        for label in options_labels.iter() {
            options.push_back(PollOption {
                label,
                vote_count: 0,
            });
        }
        
        // Generate next poll ID
        let count: u32 = env.storage().instance().get(&DataKey::PollCount).unwrap_or(0);
        let next_id = count + 1;
        
        // Create poll
        let poll = Poll {
            id: next_id,
            creator: creator.clone(),
            title,
            description,
            options,
            total_votes: 0,
            status: PollStatus::Active,
            created_at: env.ledger().timestamp(),
            end_time,
        };
        
        // Store poll
        env.storage().instance().set(&DataKey::PollCount, &next_id);
        env.storage().persistent().set(&DataKey::Poll(next_id), &poll);
        
        // Extend TTL for long-term storage
        env.storage().instance().extend_ttl(500000, 1000000);
        env.storage().persistent().extend_ttl(&DataKey::Poll(next_id), 500000, 1000000);
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "poll_created"), next_id, creator.clone()),
            (poll.title.clone(), poll.description.clone()),
        );
        
        // Notify event contract if registered
        Self::notify_event_contract(&env, Symbol::new(&env, "poll_created"), creator.clone(), next_id);
        
        next_id
    }
    
    /// Cast a vote on a poll
    pub fn vote(env: Env, voter: Address, poll_id: u32, option_index: u32) {
        voter.require_auth();
        
        // Check if contract is paused
        if Self::is_paused(env.clone()) {
            panic!("Contract operations are paused");
        }
        
        // Get poll
        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&DataKey::Poll(poll_id))
            .unwrap_or_else(|| panic!("Poll not found"));
        
        // Validate poll status
        if poll.status != PollStatus::Active {
            panic!("Poll is not active");
        }
        
        // Check if poll has ended
        if poll.end_time > 0 && env.ledger().timestamp() >= poll.end_time {
            poll.status = PollStatus::Ended;
            env.storage().persistent().set(&DataKey::Poll(poll_id), &poll);
            panic!("Poll has ended");
        }
        
        // Validate option index
        if option_index >= poll.options.len() {
            panic!("Invalid option index");
        }
        
        // Check if already voted
        let voter_key = DataKey::Voter(poll_id, voter.clone());
        if env.storage().persistent().has(&voter_key) {
            panic!("Already voted");
        }
        
        // Update vote count
        let mut option = poll.options.get(option_index).unwrap();
        option.vote_count += 1;
        poll.options.set(option_index, option);
        poll.total_votes += 1;
        
        // Save updated poll
        env.storage().persistent().set(&DataKey::Poll(poll_id), &poll);
        env.storage().persistent().set(&voter_key, &true);
        
        // Extend TTL
        env.storage().persistent().extend_ttl(&DataKey::Poll(poll_id), 500000, 1000000);
        env.storage().persistent().extend_ttl(&voter_key, 500000, 1000000);
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "vote_cast"), poll_id, voter.clone()),
            (option_index, poll.title.clone()),
        );
        
        // Notify event contract
        Self::notify_event_contract(&env, Symbol::new(&env, "vote_cast"), voter.clone(), poll_id);
    }
    
    /// Close a poll (only creator or moderator)
    pub fn close_poll(env: Env, caller: Address, poll_id: u32) {
        caller.require_auth();
        
        // Check if contract is paused
        if Self::is_paused(env.clone()) {
            panic!("Contract operations are paused");
        }
        
        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&DataKey::Poll(poll_id))
            .unwrap_or_else(|| panic!("Poll not found"));
        
        // Verify caller is creator or moderator
        let is_creator = poll.creator == caller;
        let is_moderator = Self::is_moderator(&env, &caller);
        
        if !is_creator && !is_moderator {
            panic!("Only creator or moderator can close the poll");
        }
        
        if poll.status != PollStatus::Active {
            panic!("Poll is not active");
        }
        
        poll.status = PollStatus::Closed;
        env.storage().persistent().set(&DataKey::Poll(poll_id), &poll);
        env.storage().persistent().extend_ttl(&DataKey::Poll(poll_id), 500000, 1000000);
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "poll_closed"), poll_id, caller.clone()),
            poll.title.clone(),
        );
        
        // Notify event contract
        Self::notify_event_contract(&env, Symbol::new(&env, "poll_closed"), caller.clone(), poll_id);
    }

    // ========================================================================
    // Event Contract Management
    // ========================================================================
    
    /// Register an event stream contract address
    pub fn register_event_contract(env: Env, caller: Address, contract_addr: Address) {
        caller.require_auth();
        Self::verify_admin(&env, &caller);
        
        env.storage().instance().set(&DataKey::EventContract, &contract_addr);
        
        env.events().publish(
            (Symbol::new(&env, "event_contract_registered"), caller),
            contract_addr,
        );
    }
    
    /// Remove event contract registration
    pub fn remove_event_contract(env: Env, caller: Address) {
        caller.require_auth();
        Self::verify_admin(&env, &caller);
        
        env.storage().instance().remove(&DataKey::EventContract);
        
        env.events().publish(
            (Symbol::new(&env, "event_contract_removed"), caller),
            (),
        );
    }

    // ========================================================================
    // Read-Only Functions
    // ========================================================================
    
    /// Get a specific poll
    pub fn get_poll(env: Env, poll_id: u32) -> Poll {
        env.storage()
            .persistent()
            .get(&DataKey::Poll(poll_id))
            .unwrap_or_else(|| panic!("Poll not found"))
    }
    
    /// Get total number of polls
    pub fn get_poll_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::PollCount).unwrap_or(0)
    }
    
    /// Get polls (paginated) - newest first
    pub fn get_polls(env: Env, start: u32, limit: u32) -> Vec<Poll> {
        let count = Self::get_poll_count(env.clone());
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
        let max_limit = limit.min(50);
        
        while current_id > 0 && fetched < max_limit {
            if let Some(poll) = env.storage().persistent().get(&DataKey::Poll(current_id)) {
                results.push_back(poll);
                fetched += 1;
            }
            current_id -= 1;
        }
        
        results
    }
    
    /// Check if a user has voted on a poll
    pub fn get_voter(env: Env, poll_id: u32, voter: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Voter(poll_id, voter))
            .unwrap_or(false)
    }
    
    /// Get contract version
    pub fn get_version(env: Env) -> String {
        env.storage().instance().get(&DataKey::Version).unwrap_or(String::from_str(&env, "0.0.0"))
    }
    
    /// Get current admin
    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"))
    }
    
    /// Check if address is a moderator
    pub fn is_moderator(env: &Env, addr: &Address) -> bool {
        let moderators: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Moderators)
            .unwrap_or_else(|| Vec::new(env));
        
        for moderator in moderators.iter() {
            if moderator == *addr {
                return true;
            }
        }
        false
    }
    
    /// Get user role
    pub fn get_user_role(env: Env, addr: Address) -> UserRole {
        env.storage()
            .instance()
            .get(&DataKey::UserRoles(addr))
            .unwrap_or(UserRole::User)
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
    
    fn validate_poll_input(
        env: &Env,
        title: &String,
        description: &String,
        options: &Vec<String>,
    ) {
        // Title validation
        if title.len() == 0 || title.len() > 200 {
            panic!("Title must be between 1 and 200 characters");
        }
        
        // Description validation
        if description.len() > 1000 {
            panic!("Description cannot exceed 1000 characters");
        }
        
        // Options validation
        if options.len() < 2 {
            panic!("Poll must have at least 2 options");
        }
        if options.len() > 10 {
            panic!("Poll cannot have more than 10 options");
        }
        
        // Validate each option label
        for option in options.iter() {
            if option.len() == 0 || option.len() > 100 {
                panic!("Option labels must be between 1 and 100 characters");
            }
        }
        
        // Validate end time if provided
        let current_time = env.ledger().timestamp();
        // Note: end_time validation is done in the calling function
    }
    
    fn notify_event_contract(env: &Env, topic: Symbol, source: Address, poll_id: u32) {
        if let Some(event_addr) = env.storage().instance().get::<_, Address>(&DataKey::EventContract) {
            let mut args: Vec<Val> = Vec::new(env);
            args.push_back(topic.into_val(env));
            args.push_back(source.into_val(env));
            args.push_back(poll_id.into_val(env));
            
            // Try to notify, but don't fail if event contract doesn't exist
            let result: Result<(), soroban_sdk::Error> = env.try_invoke_contract(
                &event_addr,
                &Symbol::new(env, "notify"),
                args,
            );
            
            if result.is_err() {
                // Log but don't fail the main operation
                env.logs().add(
                    Symbol::new(env, "event_notification_failed"),
                    &String::from_str(env, "Event contract notification failed"),
                );
            }
        }
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::Env;

    #[contract]
    pub struct MockEventContract;

    #[contractimpl]
    impl MockEventContract {
        pub fn notify(_env: Env, _topic: Symbol, _source: Address, _poll_id: u32) {}
    }

    #[test]
    fn test_initialize_contract() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        assert_eq!(client.get_admin(), admin);
        assert_eq!(client.get_version(), String::from_str(&e, "1.0.0"));
        assert!(!client.is_paused());
    }

    #[test]
    #[should_panic(expected = "Contract already initialized")]
    fn test_double_initialize() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);
        client.initialize(&admin); // Should panic
    }

    #[test]
    fn test_create_poll_with_validation() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let creator = Address::generate(&e);
        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "Option A"));
        labels.push_back(String::from_slice(&e, "Option B"));

        let id = client.create_poll(
            &creator,
            &String::from_slice(&e, "Test Poll"),
            &String::from_slice(&e, "Test description"),
            &labels,
            &0,
        );
        
        assert_eq!(id, 1);

        let poll = client.get_poll(&id);
        assert_eq!(poll.title, String::from_slice(&e, "Test Poll"));
        assert_eq!(poll.options.len(), 2);
        assert_eq!(poll.total_votes, 0);
        assert!(matches!(poll.status, PollStatus::Active));
    }

    #[test]
    fn test_vote_success() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let creator = Address::generate(&e);
        let voter = Address::generate(&e);

        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "Yes"));
        labels.push_back(String::from_slice(&e, "No"));

        let id = client.create_poll(
            &creator,
            &String::from_slice(&e, "Vote?"),
            &String::from_slice(&e, "d"),
            &labels,
            &0,
        );

        client.vote(&voter, &id, &0);
        
        assert!(client.get_voter(&id, &voter));

        let poll = client.get_poll(&id);
        assert_eq!(poll.total_votes, 1);
        assert_eq!(poll.options.get(0).unwrap().vote_count, 1);
    }

    #[test]
    #[should_panic(expected = "Already voted")]
    fn test_vote_double() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let creator = Address::generate(&e);
        let voter = Address::generate(&e);

        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "Yes"));
        labels.push_back(String::from_slice(&e, "No"));

        let id = client.create_poll(&creator, &String::from_slice(&e, "Vote?"), &String::from_slice(&e, "d"), &labels, &0);

        client.vote(&voter, &id, &0);
        client.vote(&voter, &id, &1); // Should panic
    }

    #[test]
    fn test_close_poll_by_creator() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let creator = Address::generate(&e);
        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "A"));
        labels.push_back(String::from_slice(&e, "B"));

        let id = client.create_poll(&creator, &String::from_slice(&e, "Close?"), &String::from_slice(&e, "d"), &labels, &0);
        client.close_poll(&creator, &id);

        let poll = client.get_poll(&id);
        assert!(matches!(poll.status, PollStatus::Closed));
    }

    #[test]
    #[should_panic(expected = "Only creator or moderator can close the poll")]
    fn test_close_poll_unauthorized() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let creator = Address::generate(&e);
        let unauthorized = Address::generate(&e);
        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "A"));
        labels.push_back(String::from_slice(&e, "B"));

        let id = client.create_poll(&creator, &String::from_slice(&e, "Close?"), &String::from_slice(&e, "d"), &labels, &0);
        client.close_poll(&unauthorized, &id); // Should panic
    }

    #[test]
    fn test_add_moderator() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let moderator = Address::generate(&e);
        client.add_moderator(&admin, &moderator);

        assert!(client.is_moderator(&moderator));
        assert!(matches!(client.get_user_role(&moderator), UserRole::Moderator));
    }

    #[test]
    fn test_moderator_can_close_poll() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let creator = Address::generate(&e);
        let moderator = Address::generate(&e);
        
        client.add_moderator(&admin, &moderator);

        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "A"));
        labels.push_back(String::from_slice(&e, "B"));

        let id = client.create_poll(&creator, &String::from_slice(&e, "Mod Close"), &String::from_slice(&e, "d"), &labels, &0);
        client.close_poll(&moderator, &id); // Moderator can close

        let poll = client.get_poll(&id);
        assert!(matches!(poll.status, PollStatus::Closed));
    }

    #[test]
    fn test_pause_unpause() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        assert!(!client.is_paused());
        
        client.pause(&admin);
        assert!(client.is_paused());
        
        client.unpause(&admin);
        assert!(!client.is_paused());
    }

    #[test]
    #[should_panic(expected = "Contract operations are paused")]
    fn test_create_poll_when_paused() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);
        client.pause(&admin);

        let creator = Address::generate(&e);
        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "A"));
        labels.push_back(String::from_slice(&e, "B"));

        client.create_poll(&creator, &String::from_slice(&e, "Test"), &String::from_slice(&e, "d"), &labels, &0);
    }

    #[test]
    fn test_transfer_ownership() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        let new_admin = Address::generate(&e);
        
        client.initialize(&admin);
        client.transfer_ownership(&admin, &new_admin);

        assert_eq!(client.get_admin(), new_admin);
    }

    #[test]
    fn test_get_polls_pagination() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let admin = Address::generate(&e);
        client.initialize(&admin);

        let creator = Address::generate(&e);
        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "A"));
        labels.push_back(String::from_slice(&e, "B"));

        // Create 5 polls
        for i in 0..5 {
            client.create_poll(
                &creator,
                &String::from_slice(&e, &format!("P{}", i)),
                &String::from_slice(&e, "d"),
                &labels,
                &0,
            );
        }

        assert_eq!(client.get_poll_count(), 5);

        // Get first 3 (newest first)
        let polls = client.get_polls(&0, &3);
        assert_eq!(polls.len(), 3);
        assert_eq!(polls.get(0).unwrap().id, 5);
        assert_eq!(polls.get(1).unwrap().id, 4);
        assert_eq!(polls.get(2).unwrap().id, 3);
    }

    #[test]
    fn test_register_event_contract_and_notify() {
        let e = Env::default();
        e.mock_all_auths();

        let poll_contract_id = e.register_contract(None, LivePollContract);
        let poll_client = LivePollContractClient::new(&e, &poll_contract_id);

        let event_contract_id = e.register_contract(None, MockEventContract);

        let admin = Address::generate(&e);
        poll_client.initialize(&admin);
        poll_client.register_event_contract(&admin, &event_contract_id);

        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "X"));
        labels.push_back(String::from_slice(&e, "Y"));

        let id = poll_client.create_poll(&admin, &String::from_slice(&e, "Event?"), &String::from_slice(&e, "d"), &labels, &0);
        let p = poll_client.get_poll(&id);
        assert_eq!(p.title, String::from_slice(&e, "Event?"));
    }
}
