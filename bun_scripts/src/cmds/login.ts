import { Keypair } from "@stellar/stellar-sdk";
import Table from "cli-table";
import type { ArgumentsCamelCase } from "yargs";
import { horizon } from "../utils/static";

async function login() {
    const secret = prompt('Enter your Stellar secret key:')

    if (!secret) {
        throw new Error('Secret key is required')
    }

    const keypair = Keypair.fromSecret(secret)
    const pubkey = keypair.publicKey();
    const account = await horizon.loadAccount(pubkey)
    const table = new Table();

    table.push(
        { id: account.id },
        { balance: `${account.balances.find(({ asset_type }) => asset_type === 'native')?.balance || '0'} XLM` },
        { sequence: account.sequence },
        { last_modified_ledger: account.last_modified_ledger.toString() },
        { last_modified_time: account.last_modified_time },
    );
    
    await Bun.write(`${Bun.env.HOME || ''}/.config/betn/.env`, `SECRET=${secret}`)

    console.log(table.toString())
}

export const command = 'login'
export const desc = 'Login with your Stellar account'
export function handler(argv: ArgumentsCamelCase<{}>) {
    return login()
}