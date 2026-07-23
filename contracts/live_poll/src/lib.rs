#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, IntoVal, String, Symbol, Val, Vec,
};

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
pub enum DataKey {
    PollCount,                 // u32
    Poll(u32),                 // Poll
    Voter(u32, Address),       // bool
    Admin,                     // Address
    EventContract,             // Address
}

#[contract]
pub struct LivePollContract;

#[contractimpl]
impl LivePollContract {
    /// Create a new poll
    pub fn create_poll(
        env: Env,
        creator: Address,
        title: String,
        description: String,
        options_labels: Vec<String>,
        end_time: u64,
    ) -> u32 {
        creator.require_auth();

        if options_labels.len() < 2 {
            panic!("Poll must have at least 2 options");
        }
        if options_labels.len() > 10 {
            panic!("Poll cannot have more than 10 options");
        }

        let mut options = Vec::new(&env);
        for label in options_labels.iter() {
            options.push_back(PollOption {
                label,
                vote_count: 0,
            });
        }

        let count: u32 = env.storage().instance().get(&DataKey::PollCount).unwrap_or(0);
        let next_id = count + 1;

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

        env.storage().instance().set(&DataKey::PollCount, &next_id);
        env.storage().persistent().set(&DataKey::Poll(next_id), &poll);

        // Extend TTL
        env.storage().instance().extend_ttl(500000, 1000000);
        env.storage().persistent().extend_ttl(&DataKey::Poll(next_id), 500000, 1000000);

        // Emit event
        env.events().publish((Symbol::new(&env, "poll_created"), next_id, creator.clone()), ());

        // If an EventStream contract is registered, notify it
        if let Some(event_addr) = env.storage().instance().get::<_, Address>(&DataKey::EventContract) {
            let mut args: Vec<Val> = Vec::new(&env);
            args.push_back(Symbol::new(&env, "poll_created").into_val(&env));
            args.push_back(creator.clone().into_val(&env));
            args.push_back(next_id.into_val(&env));
            let _: () = env.invoke_contract(&event_addr, &Symbol::new(&env, "notify"), args);
        }

        next_id
    }

    /// Cast a vote on a poll
    pub fn vote(env: Env, voter: Address, poll_id: u32, option_index: u32) {
        voter.require_auth();

        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&DataKey::Poll(poll_id))
            .unwrap_or_else(|| panic!("Poll not found"));

        if poll.status != PollStatus::Active {
            panic!("Poll is not active");
        }

        if poll.end_time > 0 && env.ledger().timestamp() >= poll.end_time {
            poll.status = PollStatus::Closed;
            env.storage().persistent().set(&DataKey::Poll(poll_id), &poll);
            panic!("Poll has ended");
        }

        if option_index >= poll.options.len() {
            panic!("Invalid option index");
        }

        let voter_key = DataKey::Voter(poll_id, voter.clone());
        if env.storage().persistent().has(&voter_key) {
            panic!("Already voted");
        }

        // Update vote count
        let mut option = poll.options.get(option_index).unwrap();
        option.vote_count += 1;
        poll.options.set(option_index, option);
        poll.total_votes += 1;

        // Save
        env.storage().persistent().set(&DataKey::Poll(poll_id), &poll);
        env.storage().persistent().set(&voter_key, &true);

        // Extend TTL
        env.storage().persistent().extend_ttl(&DataKey::Poll(poll_id), 500000, 1000000);
        env.storage().persistent().extend_ttl(&voter_key, 500000, 1000000);

        // Emit event
        env.events().publish((Symbol::new(&env, "vote_cast"), poll_id, voter.clone()), option_index);

        // Notify event contract if present
        if let Some(event_addr) = env.storage().instance().get::<_, Address>(&DataKey::EventContract) {
            let mut args: Vec<Val> = Vec::new(&env);
            args.push_back(Symbol::new(&env, "vote_cast").into_val(&env));
            args.push_back(voter.clone().into_val(&env));
            args.push_back(poll_id.into_val(&env));
            let _: () = env.invoke_contract(&event_addr, &Symbol::new(&env, "notify"), args);
        }
    }

    /// Close a poll (only creator)
    pub fn close_poll(env: Env, creator: Address, poll_id: u32) {
        creator.require_auth();

        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&DataKey::Poll(poll_id))
            .unwrap_or_else(|| panic!("Poll not found"));

        if poll.creator != creator {
            panic!("Only creator can close the poll");
        }

        if poll.status != PollStatus::Active {
            panic!("Poll is not active");
        }

        poll.status = PollStatus::Closed;
        env.storage().persistent().set(&DataKey::Poll(poll_id), &poll);
        env.storage().persistent().extend_ttl(&DataKey::Poll(poll_id), 500000, 1000000);

        // Emit event
        env.events().publish((Symbol::new(&env, "poll_closed"), poll_id, creator.clone()), ());

        // Notify event contract if present
        if let Some(event_addr) = env.storage().instance().get::<_, Address>(&DataKey::EventContract) {
            let mut args: Vec<Val> = Vec::new(&env);
            args.push_back(Symbol::new(&env, "poll_closed").into_val(&env));
            args.push_back(creator.clone().into_val(&env));
            args.push_back(poll_id.into_val(&env));
            let _: () = env.invoke_contract(&event_addr, &Symbol::new(&env, "notify"), args);
        }
    }

    /// Register an EventStream contract address for notifications (admin)
    pub fn register_event_contract(env: Env, caller: Address, contract_addr: Address) {
        caller.require_auth();
        let stored_admin: Option<Address> = env.storage().instance().get(&DataKey::Admin);
        if stored_admin.is_none() {
            env.storage().instance().set(&DataKey::Admin, &caller);
        } else if stored_admin.unwrap() != caller {
            panic!("not admin");
        }
        env.storage().instance().set(&DataKey::EventContract, &contract_addr);
    }

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

    /// Get polls (paginated) - highest ID first (newest)
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
}

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
    fn test_create_poll() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let acc = Address::generate(&e);
        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "Option A"));
        labels.push_back(String::from_slice(&e, "Option B"));

        let id = client.create_poll(&acc, &String::from_slice(&e, "Test?"), &String::from_slice(&e, "desc"), &labels, &0);
        assert_eq!(id, 1);

        let poll = client.get_poll(&id);
        assert_eq!(poll.title, String::from_slice(&e, "Test?"));
        assert_eq!(poll.options.len(), 2);
        assert_eq!(poll.total_votes, 0);
    }

    #[test]
    fn test_vote() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let creator = Address::generate(&e);
        let voter = Address::generate(&e);

        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "Yes"));
        labels.push_back(String::from_slice(&e, "No"));

        let id = client.create_poll(&creator, &String::from_slice(&e, "Vote?"), &String::from_slice(&e, "d"), &labels, &0);

        client.vote(&voter, &id, &0);
        assert!(client.get_voter(&id, &voter));

        let poll = client.get_poll(&id);
        assert_eq!(poll.total_votes, 1);
        assert_eq!(poll.options.get(0).unwrap().vote_count, 1);
    }

    #[test]
    fn test_close_poll() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

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
    fn test_register_event_contract_and_notify() {
        let e = Env::default();
        e.mock_all_auths();

        let poll_contract_id = e.register_contract(None, LivePollContract);
        let poll_client = LivePollContractClient::new(&e, &poll_contract_id);

        let event_contract_id = e.register_contract(None, MockEventContract);

        let admin = Address::generate(&e);
        poll_client.register_event_contract(&admin, &event_contract_id);

        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "X"));
        labels.push_back(String::from_slice(&e, "Y"));

        let id = poll_client.create_poll(&admin, &String::from_slice(&e, "Event?"), &String::from_slice(&e, "d"), &labels, &0);
        let p = poll_client.get_poll(&id);
        assert_eq!(p.title, String::from_slice(&e, "Event?"));
    }

    #[test]
    fn test_get_polls_pagination() {
        let e = Env::default();
        e.mock_all_auths();

        let contract_id = e.register_contract(None, LivePollContract);
        let client = LivePollContractClient::new(&e, &contract_id);

        let creator = Address::generate(&e);
        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "A"));
        labels.push_back(String::from_slice(&e, "B"));

        // Create 3 polls
        client.create_poll(&creator, &String::from_slice(&e, "P1"), &String::from_slice(&e, "d"), &labels, &0);
        client.create_poll(&creator, &String::from_slice(&e, "P2"), &String::from_slice(&e, "d"), &labels, &0);
        client.create_poll(&creator, &String::from_slice(&e, "P3"), &String::from_slice(&e, "d"), &labels, &0);

        assert_eq!(client.get_poll_count(), 3);

        let polls = client.get_polls(&0, &10);
        assert_eq!(polls.len(), 3);
    }
}

