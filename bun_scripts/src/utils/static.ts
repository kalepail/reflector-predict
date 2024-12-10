import { Horizon, Networks } from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";
import { Client as Oracle } from 'reflector-oracle-sdk'

export const regex = /#(\d+)\)/;
export const rpcUrl = 'https://soroban-testnet.stellar.org'
export const horizonUrl = 'https://horizon-testnet.stellar.org'
export const contractId = 'CDQII2BQRWATHWPMJA4L7EIEPCUFIX5ILGQQQKCI27HBDH2BQOBTSVLZ'
export const oracleContractId = 'CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63'

export const rpc = new Server(rpcUrl)
export const horizon = new Horizon.Server(horizonUrl)

export const oracle = new Oracle({
    rpcUrl,
    networkPassphrase: Networks.TESTNET,
    contractId: oracleContractId,
})