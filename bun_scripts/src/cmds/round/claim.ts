import type { ArgumentsCamelCase, Argv } from "yargs";
import { Api } from "@stellar/stellar-sdk/rpc";
import { Errors } from "reflector-predict-sdk";
import { regex } from "../../utils/static";
import { getSigner } from "../../utils/dynamic";

async function claimWinnings(argv: ArgumentsCamelCase<{round: number}>) {
    const { signer, contract, pubkey } = await getSigner();
    
    const { result, simulation, signAndSend, ...rest } = await contract.claim({
        player: pubkey,
        index: argv.round,
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

    console.log(`Won ${result} for round ${argv.round}`);
}

export const command = 'claim'
export const desc = 'Claim winnings for a round'
export function builder(yargs: Argv) {
    return yargs
        .positional('round', {
            describe: 'The round to claim winnings for',
            type: 'number',
        })
        .demandOption(['round'])
}
export function handler(argv: ArgumentsCamelCase<{ round: number }>) {
    return claimWinnings(argv)
}