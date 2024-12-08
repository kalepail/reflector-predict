import { Keypair, Networks } from "@stellar/stellar-sdk";
import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { Client as Contract } from 'reflector-predict-sdk'
import { contractId, rpcUrl } from "./static";
import os from 'os'

export async function getSigner() {
    const file = Bun.file(`${os.homedir()}/.config/betn/.env`)
    const envFile = Bun.TOML.parse(await file.text()) as { SECRET: string }

    if (!envFile.SECRET) {
        throw new Error('You must `betn login` first')
    } else {
        process.env.SECRET = envFile.SECRET
    }

    const keypair = Keypair.fromSecret(Bun.env.SECRET);
    const pubkey = keypair.publicKey();
    const signer = basicNodeSigner(keypair, Networks.TESTNET)

    const contract = new Contract({
        rpcUrl,
        networkPassphrase: Networks.TESTNET,
        contractId,
        publicKey: pubkey,
    })

    return {
        keypair,
        pubkey,
        signer,
        contract,
    }
}