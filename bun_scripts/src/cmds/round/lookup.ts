import type { ArgumentsCamelCase, Argv } from "yargs";
import { contractId, rpc } from "../../utils";
import { scValToNative, xdr } from "@stellar/stellar-sdk";
import Table from "cli-table";

async function lookupRound(argv: ArgumentsCamelCase<{round: number}>) {
    const res = await rpc.getContractData(contractId, xdr.ScVal.scvVec([
        xdr.ScVal.scvSymbol('Round'),
        xdr.ScVal.scvU32(argv.round)
    ]))

    const table = new Table();
    const data = scValToNative(res.val.contractData().val());

    for (const key in data) {
        if (key === 'asset')
            table.push({[key]: data.asset[1]});
        else
            table.push({[key]: String(data[key])});
    }

    console.log(table.toString())
}

export const command = 'lookup'
export const desc = 'Lookup a round'
export function builder(yargs: Argv) {
  return yargs
    .positional('round', {
        describe: 'The round to lookup',
        type: 'number',
    })
    .demandOption(['round'])
}
export function handler(argv: ArgumentsCamelCase<{round: number}>) {
    return lookupRound(argv)
}