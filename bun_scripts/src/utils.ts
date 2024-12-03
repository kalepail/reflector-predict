import { Keypair, Networks } from "@stellar/stellar-sdk";
import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { Server } from "@stellar/stellar-sdk/rpc";
import { Client as Oracle } from 'reflector-oracle-sdk'
import { Client as Contract } from 'reflector-predict-sdk'

export const regex = /#(\d+)\)/;
export const rpcUrl = 'https://soroban-testnet.stellar.org'
export const contractId = 'CCOIWMVTU7SKCCIOVKTGUOQRHVMH42AUUU5MD3T66QJTEYE6T3O7Q43N'
export const oracleContractId = 'CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63'

export const keypair = Keypair.fromSecret('SAGBB7CIPHPI4OF553UBVFADDKUENKVR2ARCKMGEFSYOJATGTOPQN6YB');
export const pubkey = keypair.publicKey(); // GCSE7SNIRVGL7QZL42OCXR4UW7PDA6CGDD5CQGLI2YXWZL6JXOEIO55Q
export const signer = basicNodeSigner(keypair, Networks.TESTNET)

export const rpc = new Server(rpcUrl)

export const contract = new Contract({
    rpcUrl,
    networkPassphrase: Networks.TESTNET,
    contractId,
    publicKey: pubkey,
})

export const oracle = new Oracle({
    rpcUrl,
    networkPassphrase: Networks.TESTNET,
    contractId: oracleContractId,
})