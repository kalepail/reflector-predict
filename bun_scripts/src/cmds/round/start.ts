import { Api } from "@stellar/stellar-sdk/rpc";
import { Errors } from "reflector-oracle-sdk";
import type { ArgumentsCamelCase, Argv } from "yargs";
import { contract, oracle, regex, signer } from "../../utils";

async function startRound(argv: ArgumentsCamelCase<{asset: string}>) {
    const { result: assets } = await oracle.assets()

    const asset = assets.find((asset) => asset.values.includes(argv.asset))

    if (!asset) {
        throw new Error(`${argv.asset} asset not found`)
    }

    const { result, signAndSend, simulation } = await contract.start_round({
        asset,
        expiration: BigInt(Math.floor(Date.now() / 1000) + (5 * 60)),
        // expiration: BigInt(Math.floor(Date.now() / 1000) + (24 * 60 * 60)),
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

    console.log(`Round ${result} started for ${argv.asset}`);
}

export const command = 'start'
export const desc = 'Start a new round'
export function builder(yargs: Argv) {
  return yargs
    .positional('asset', {
        describe: 'The asset to start the round for',
    })
    .demandOption(['asset'])
}
export function handler(argv: ArgumentsCamelCase<{asset: string}>) {
    return startRound(argv)
}