import type { ArgumentsCamelCase, Argv } from "yargs";
import { contract, pubkey, regex, signer } from '../../utils';
import { Api } from '@stellar/stellar-sdk/rpc';
import { Errors } from 'reflector-predict-sdk';
import Table from "cli-table";

async function placeBet(argv: ArgumentsCamelCase<{ round: number, amount: number, hilo: 'hi' | 'lo' }>) {
    const { result, simulation, signAndSend } = await contract.bet({
        player: pubkey,
        id: argv.round,
        amount: BigInt(argv.amount),
        hilo: argv.hilo === 'hi' ? { tag: 'Higher', values: undefined } : { tag: 'Lower', values: undefined },
    })

    if (!simulation) {
        throw new Error('Simulation failed');
    }

    if (Api.isSimulationError(simulation)) {
        const match = simulation.error.match(regex);

        if (match?.[1]) {
            const { message } = Errors[match[1] as unknown as keyof typeof Errors]
            throw new Error(message);
        } else {
            throw new Error(simulation.error);
        }
    }

    await signAndSend({
        signTransaction: signer.signTransaction
    })

    const table = new Table();

    for (const key in result) {
        if (key === 'asset')
            table.push({[key]: result.asset.values[0]});
        else 
            table.push({[key]: String(result[key as keyof typeof result])});
    }

    console.log(table.toString())

    console.log(`Bet ${argv.amount} that round ${argv.round} asset will be ${argv.hilo === 'hi' ? 'higher' : 'lower'} when it closes`);
}

export const command = 'place'
export const desc = 'Place your bet for a round'
export function builder(yargs: Argv) {
    return yargs
        .positional('round', {
            describe: 'The round to place the bet for',
            type: 'number',
        })
        .positional('amount', {
            // TODO the amount should likely be multiplied by 1e7
            describe: 'The amount to bet',
            type: 'number',
        })
        .positional('hilo', {
            describe: 'Whether the bet is high or low',
            choices: ['hi', 'lo'],
        })
        .demandOption(['round', 'amount', 'hilo'])
        .example('betn bet place --round 1 --amount 100 --hilo hi', 'Betting 100 that round 1 asset will be higher when it closes')
}
export function handler(argv: ArgumentsCamelCase<{ round: number, amount: number, hilo: 'hi' | 'lo' }>) {
    return placeBet(argv)
}