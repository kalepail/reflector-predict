import type { ArgumentsCamelCase, Argv } from "yargs";
import { contractId, pubkey, rpc } from "../../utils";
import { Address, scValToNative, xdr } from "@stellar/stellar-sdk";
import { Durability } from "@stellar/stellar-sdk/rpc";
import Table from "cli-table";

async function lookupBet(argv: ArgumentsCamelCase<{ round: number }>) {
    const res = await rpc.getContractData(contractId, xdr.ScVal.scvVec([
        xdr.ScVal.scvSymbol('Bet'),
        xdr.ScVal.scvU32(argv.round),
        Address.fromString(pubkey).toScVal(),
    ]), Durability.Temporary)

    const table = new Table();
    const data = scValToNative(res.val.contractData().val());

    for (const key in data) {
        table.push({[key]: String(data[key])});
    }

    console.log(table.toString())
}

export const command = 'lookup'
export const desc = 'Lookup a bet for a round'
export function builder(yargs: Argv) {
    return yargs
        .positional('round', {
            describe: 'The round to lookup the bet for',
            type: 'number',
        })
        .demandOption(['round'])
}
export function handler(argv: ArgumentsCamelCase<{ round: number }>) {
    return lookupBet(argv)
}