#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec, BytesN,
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

        // Emit event: topic1 = "poll_created", topic2 = poll_id, topic3 = creator
        env.events().publish((Symbol::new(&env, "poll_created"), next_id, creator.clone()), ());

        // If an EventStream contract is registered, notify it (best-effort)
        if let Some(cid) = env.storage().instance().get::<_, BytesN<32>>(&Symbol::short("event_contract")) {
            let _: () = env.invoke_contract(
                &cid,
                &Symbol::short("notify"),
                (Symbol::short("poll_created"), creator.clone(), next_id),
            );
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

        // Emit event: topic1 = "vote_cast", topic2 = poll_id, topic3 = voter
        env.events().publish((Symbol::new(&env, "vote_cast"), poll_id, voter.clone()), option_index);

        // Notify event contract if present (best-effort)
        if let Some(cid) = env.storage().instance().get::<_, BytesN<32>>(&Symbol::short("event_contract")) {
            let _: () = env.invoke_contract(
                &cid,
                &Symbol::short("notify"),
                (Symbol::short("vote_cast"), voter.clone(), poll_id),
            );
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

        // Emit event: topic1 = "poll_closed", topic2 = poll_id, topic3 = creator
        env.events().publish((Symbol::new(&env, "poll_closed"), poll_id, creator.clone()), ());

        // Notify event contract if present (best-effort)
        if let Some(cid) = env.storage().instance().get::<_, BytesN<32>>(&Symbol::short("event_contract")) {
            let _: () = env.invoke_contract(
                &cid,
                &Symbol::short("notify"),
                (Symbol::short("poll_closed"), creator.clone(), poll_id),
            );
        }
    }

    /// Register an EventStream contract id for notifications (admin)
    pub fn register_event_contract(env: Env, caller: Address, contract_id: BytesN<32>) {
        caller.require_auth();
        let stored_admin: Option<Address> = env.storage().instance().get(&Symbol::short("admin"));
        if stored_admin.is_none() {
            env.storage().instance().set(&Symbol::short("admin"), &caller);
        } else if stored_admin.unwrap() != caller {
            panic!("not admin");
        }
        env.storage().instance().set(&Symbol::short("event_contract"), &contract_id);
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

        // Calculate start index (counting down from highest)
        let mut current_id = if start == 0 {
            count
        } else {
            count.saturating_sub(start)
        };

        let mut fetched = 0;
        let max_limit = limit.min(50); // Hard limit to prevent gas issues

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
    use soroban_sdk::{testutils::Address as TestAddress, Env, BytesN};

    #[test]
    fn test_create_vote_close() {
        let e = Env::default();
        let acc = Address::from(TestAddress::from_account_id(&e, &e.generate_account_id()));
        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "a"));
        labels.push_back(String::from_slice(&e, "b"));
        let id = LivePollContract::create_poll(e.clone(), acc.clone(), String::from_slice(&e, "Q?"), String::from_slice(&e, "desc"), labels.clone(), 0);
        let poll = LivePollContract::get_poll(e.clone(), id);
        assert_eq!(poll.title, String::from_slice(&e, "Q?"));

        let voter = Address::from(TestAddress::from_account_id(&e, &e.generate_account_id()));
        LivePollContract::vote(e.clone(), voter.clone(), id, 0);
        assert!(LivePollContract::get_voter(e.clone(), id, voter.clone()));

        // double vote should panic
        let res = std::panic::catch_unwind(|| {
            LivePollContract::vote(e.clone(), voter.clone(), id, 0);
        });
        assert!(res.is_err());

        // close poll
        LivePollContract::close_poll(e.clone(), acc.clone(), id);
        let p = LivePollContract::get_poll(e.clone(), id);
        assert!(matches!(p.status, PollStatus::Closed));
    }

    #[test]
    fn test_register_event_contract_and_notify() {
        let e = Env::default();
        let admin = Address::from(TestAddress::from_account_id(&e, &e.generate_account_id()));
        let mut b = [0u8;32];
        b[0] = 9;
        let cid = BytesN::from_array(&e, &b);
        LivePollContract::register_event_contract(e.clone(), admin.clone(), cid.clone());

        let mut labels = Vec::new(&e);
        labels.push_back(String::from_slice(&e, "x"));
        labels.push_back(String::from_slice(&e, "y"));
        let id = LivePollContract::create_poll(e.clone(), admin.clone(), String::from_slice(&e, "T?"), String::from_slice(&e, "d"), labels.clone(), 0);
        let p = LivePollContract::get_poll(e.clone(), id);
        assert_eq!(p.title, String::from_slice(&e, "T?"));
    }
}
