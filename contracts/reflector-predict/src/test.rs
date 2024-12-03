#![cfg(test)]

extern crate std;
use std::println;

use crate::{reflector_oracle::Asset, HiLo};
use crate::{Contract, ContractClient};
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, EnvTestConfig, Ledger},
    token, Address, Env, String,
};

#[test]
fn test() {
    let mut env = Env::from_ledger_snapshot_file("../../snapshot.json");

    env.mock_all_auths();
    env.ledger().set_timestamp(1732659043 - 600);
    env.set_config(EnvTestConfig {
        capture_snapshot_at_drop: false,
    });

    let contract_id = env.register_contract(None, Contract);
    let client = ContractClient::new(&env, &contract_id);

    let reflector_address = Address::from_string(&String::from_str(
        &env,
        "CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN",
    ));

    let asset_admin = Address::generate(&env);
    let asset_sac = env.register_stellar_asset_contract_v2(asset_admin.clone());
    let asset_address = asset_sac.address();
    let asset_sac_client = token::StellarAssetClient::new(&env, &asset_address);
    // let asset_client = token::Client::new(&env, &asset_address);

    client.init(&asset_admin, &reflector_address, &asset_address);

    let asset = Asset::Other(symbol_short!("BTC"));
    let expiration = env.ledger().timestamp() + 300;

    let id = client.start_round(&asset, &expiration);

    let player1 = Address::generate(&env);
    let player2 = Address::generate(&env);
    let player3 = Address::generate(&env);
    let player4 = Address::generate(&env);

    asset_sac_client.mint(&player1, &100);
    asset_sac_client.mint(&player2, &100);
    asset_sac_client.mint(&player3, &100);
    asset_sac_client.mint(&player4, &100);

    let round1 = client.bet(&player1, &id, &100, &HiLo::Lower);
    let round2 = client.bet(&player2, &id, &100, &HiLo::Higher);

    env.ledger().set_timestamp(expiration / 2);

    let round3 = client.bet(&player3, &id, &100, &HiLo::Lower);
    let round4 = client.bet(&player4, &id, &100, &HiLo::Higher);

    println!("{:?}", round1);
    println!("{:?}", round2);
    println!("{:?}", round3);
    println!("{:?}", round4);

    env.ledger().set_timestamp(expiration + 1);

    let reward2 = client.claim(&player2, &id);
    let reward4 = client.claim(&player4, &id);

    println!("{:?}", reward2);
    println!("{:?}", reward4);
}
