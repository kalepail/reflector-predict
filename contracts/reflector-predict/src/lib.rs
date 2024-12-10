#![no_std]

use reflector_oracle::{Asset, Client as Oracle};
use soroban_fixed_point_math::SorobanFixedPoint;
use soroban_sdk::{
    auth::{Context, CustomAccountInterface},
    contract, contracterror, contractimpl, contracttype,
    crypto::Hash,
    panic_with_error, token, vec, Address, BytesN, Env, Val, Vec,
};

pub mod reflector_oracle;

mod test;

// TODO likely we should extend ttl for temporary entries past 24 hrs to something like a week
// Go ahead and extend persistent and instance storage as well

#[contracterror]
#[derive(Copy, Clone)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    RoundNotFound = 3,
    RoundExpired = 4,
    RoundNotExpired = 5,
    BetAmountTooLow = 6,
    BetNotFound = 7,
    BetAlready = 8,
    BetLost = 9,
}

#[contracttype]
#[derive(Copy, Clone, PartialEq)]
pub enum HiLo {
    Lower,
    Higher,
}

#[contracttype]
pub enum Store {
    Admin,
    Oracle,
    Asset,
    Index,
    Round(u32),
    Bet(u32, Address),
}

#[contracttype]
#[derive(Debug)]
pub struct Round {
    pub expiration: u64,
    pub asset: Asset,
    pub start_price: i128,
    pub end_price: Option<i128>,
    pub amount_higher: i128,
    pub amount_lower: i128,
    pub share_higher: i128,
    pub share_lower: i128,
}

#[contracttype]
pub struct Bet {
    pub ttl: u64,
    pub amount: i128,
    pub hilo: HiLo,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn __constructor(env: Env, admin: Address, oracle: Address, asset: Address) {
        if env.storage().instance().has(&Store::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }

        env.storage().instance().set(&Store::Admin, &admin);
        env.storage().instance().set(&Store::Oracle, &oracle);
        env.storage().instance().set(&Store::Asset, &asset);
    }

    pub fn upgrade(env: Env, hash: BytesN<32>) {
        let admin = env
            .storage()
            .instance()
            .get::<Store, Address>(&Store::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotInitialized));

        admin.require_auth();

        env.deployer().update_current_contract_wasm(hash);
    }

    pub fn start_round(env: Env, asset: Asset, expiration: u64) -> u32 {
        let index = match env.storage().instance().get::<Store, u32>(&Store::Index) {
            Some(index) => index + 1,
            None => 0,
        };

        let price = Self::get_price(&env, &asset);

        env.storage().persistent().set::<Store, Round>(
            &Store::Round(index),
            &Round {
                expiration,
                asset,
                start_price: price,
                end_price: None,
                amount_higher: 0,
                amount_lower: 0,
                share_higher: 0,
                share_lower: 0,
            },
        );

        env.storage()
            .instance()
            .set::<Store, u32>(&Store::Index, &index);

        index
    }

    pub fn bet(env: Env, player: Address, index: u32, amount: i128, hilo: HiLo) -> Round {
        player.require_auth();

        let round_key = Store::Round(index);
        let bet_key = Store::Bet(index, player.clone());

        let mut round = env
            .storage()
            .persistent()
            .get::<Store, Round>(&round_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::RoundNotFound));

        let now = env.ledger().timestamp();

        if now > round.expiration {
            panic_with_error!(&env, Error::RoundExpired);
        }

        if env
            .storage()
            .temporary()
            .get::<Store, Bet>(&bet_key)
            .is_some()
        {
            panic_with_error!(&env, Error::BetAlready);
        }

        if amount <= 0 {
            panic_with_error!(&env, Error::BetAmountTooLow);
        }

        let asset = env
            .storage()
            .instance()
            .get::<Store, Address>(&Store::Asset)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotInitialized));

        token::Client::new(&env, &asset).transfer(
            &player,
            &env.current_contract_address(),
            &amount,
        );

        let bet = Bet {
            ttl: round.expiration - now,
            amount,
            hilo,
        };

        match hilo {
            HiLo::Lower => {
                round.amount_lower += bet.amount;
                round.share_lower += bet.amount * bet.ttl as i128
            }
            HiLo::Higher => {
                round.amount_higher += bet.amount;
                round.share_higher += bet.amount * bet.ttl as i128
            }
        }

        env.storage()
            .persistent()
            .set::<Store, Round>(&round_key, &round);

        env.storage().temporary().set::<Store, Bet>(&bet_key, &bet);

        round
    }

    pub fn claim(env: Env, player: Address, index: u32) -> i128 {
        let mut round = env
            .storage()
            .persistent()
            .get::<Store, Round>(&Store::Round(index))
            .unwrap_or_else(|| panic_with_error!(&env, Error::RoundNotFound));

        if env.ledger().timestamp() <= round.expiration {
            panic_with_error!(&env, Error::RoundNotExpired);
        }

        let bet_key = Store::Bet(index, player.clone());

        let bet = env
            .storage()
            .temporary()
            .get::<Store, Bet>(&bet_key)
            .unwrap_or_else(|| panic_with_error!(&env, Error::BetNotFound));

        let price = match round.end_price {
            Some(price) => price,
            None => {
                let price = Self::get_price(&env, &round.asset);

                round.end_price = Some(price);

                env.storage()
                    .persistent()
                    .set::<Store, Round>(&Store::Round(index), &round);

                price
            },
        };

        let (total_amount, total_share) = match bet.hilo {
            HiLo::Lower => {
                if round.start_price > price {
                    panic_with_error!(&env, Error::BetLost)
                }

                (round.amount_higher, round.share_lower)
            }
            HiLo::Higher => {
                if round.start_price <= price {
                    panic_with_error!(&env, Error::BetLost)
                }

                (round.amount_lower, round.share_higher)
            }
        };

        let asset = env
            .storage()
            .instance()
            .get::<Store, Address>(&Store::Asset)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotInitialized));

        // TODO if some of these values are zero we should deliver a better error

        let amount =
            (bet.amount * bet.ttl as i128).fixed_div_floor(&env, &total_share, &total_amount)
                + bet.amount;

        token::Client::new(&env, &asset).transfer(
            &env.current_contract_address(),
            &player,
            &amount,
        );

        env.storage().temporary().remove::<Store>(&bet_key);

        amount
    }

    fn get_price(env: &Env, asset: &Asset) -> i128 {
        let oracle = match env
            .storage()
            .instance()
            .get::<Store, Address>(&Store::Oracle)
        {
            Some(oracle) => Oracle::new(&env, &oracle),
            None => panic_with_error!(&env, Error::NotInitialized),
        };

        let mut timestamp = env.ledger().timestamp();
        let mut price_data = oracle.price(&asset, &timestamp);

        while price_data.is_none() {
            timestamp -= oracle.resolution() as u64;
            price_data = oracle.price(&asset, &timestamp);
        }

        price_data.unwrap().price
    }
}

#[contractimpl]
impl CustomAccountInterface for Contract {
    type Error = Error;
    type Signature = Option<Vec<Val>>;

    #[allow(non_snake_case)]
    fn __check_auth(
        env: Env,
        _signature_payload: Hash<32>,
        _signatures: Option<Vec<Val>>,
        _auth_contexts: Vec<Context>,
    ) -> Result<(), Error> {
        let admin = env
            .storage()
            .instance()
            .get::<Store, Address>(&Store::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, Error::NotInitialized));

        admin.require_auth_for_args(vec![&env]);

        Ok(())
    }
}
