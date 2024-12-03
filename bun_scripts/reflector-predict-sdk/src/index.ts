import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCOIWMVTU7SKCCIOVKTGUOQRHVMH42AUUU5MD3T66QJTEYE6T3O7Q43N",
  }
} as const

export type Asset = {tag: "Stellar", values: readonly [string]} | {tag: "Other", values: readonly [string]};

export const Errors = {
  1: {message:"AlreadyInitialized"},

  2: {message:"BadHiLo"},

  3: {message:"AmountTooLow"},

  4: {message:"NotInitialized"},

  5: {message:"OracleError"},

  6: {message:"RoundNotFound"},

  7: {message:"RoundExpired"},

  8: {message:"BetNotFound"},

  9: {message:"AlreadyBet"},

  10: {message:"RoundNotExpired"},

  11: {message:"BetLost"}
}
export type HiLo = {tag: "Lower", values: void} | {tag: "Higher", values: void};

export type Store = {tag: "Admin", values: void} | {tag: "Oracle", values: void} | {tag: "Asset", values: void} | {tag: "Index", values: void} | {tag: "Round", values: readonly [u32]} | {tag: "Bet", values: readonly [u32, string]};


export interface Round {
  amount_higher: i128;
  amount_lower: i128;
  asset: Asset;
  end_price: Option<i128>;
  expiration: u64;
  share_higher: i128;
  share_lower: i128;
  start_price: i128;
}


export interface Bet {
  amount: i128;
  hilo: HiLo;
  ttl: u64;
}


export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  init: ({admin, oracle, asset}: {admin: string, oracle: string, asset: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: ({hash}: {hash: Buffer}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a start_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  start_round: ({asset, expiration}: {asset: Asset, expiration: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a bet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  bet: ({player, id, amount, hilo}: {player: string, id: u32, amount: i128, hilo: HiLo}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Round>>

  /**
   * Construct and simulate a claim transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim: ({player, id}: {player: string, id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

}
export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACwAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAAdCYWRIaUxvAAAAAAIAAAAAAAAADEFtb3VudFRvb0xvdwAAAAMAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAAEAAAAAAAAAAtPcmFjbGVFcnJvcgAAAAAFAAAAAAAAAA1Sb3VuZE5vdEZvdW5kAAAAAAAABgAAAAAAAAAMUm91bmRFeHBpcmVkAAAABwAAAAAAAAALQmV0Tm90Rm91bmQAAAAACAAAAAAAAAAKQWxyZWFkeUJldAAAAAAACQAAAAAAAAAPUm91bmROb3RFeHBpcmVkAAAAAAoAAAAAAAAAB0JldExvc3QAAAAACw==",
        "AAAAAgAAAAAAAAAAAAAABEhpTG8AAAACAAAAAAAAAAAAAAAFTG93ZXIAAAAAAAAAAAAAAAAAAAZIaWdoZXIAAA==",
        "AAAAAgAAAAAAAAAAAAAABVN0b3JlAAAAAAAABgAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAGT3JhY2xlAAAAAAAAAAAAAAAAAAVBc3NldAAAAAAAAAAAAAAAAAAABUluZGV4AAAAAAAAAQAAAAAAAAAFUm91bmQAAAAAAAABAAAABAAAAAEAAAAAAAAAA0JldAAAAAACAAAABAAAABM=",
        "AAAAAQAAAAAAAAAAAAAABVJvdW5kAAAAAAAACAAAAAAAAAANYW1vdW50X2hpZ2hlcgAAAAAAAAsAAAAAAAAADGFtb3VudF9sb3dlcgAAAAsAAAAAAAAABWFzc2V0AAAAAAAH0AAAAAVBc3NldAAAAAAAAAAAAAAJZW5kX3ByaWNlAAAAAAAD6AAAAAsAAAAAAAAACmV4cGlyYXRpb24AAAAAAAYAAAAAAAAADHNoYXJlX2hpZ2hlcgAAAAsAAAAAAAAAC3NoYXJlX2xvd2VyAAAAAAsAAAAAAAAAC3N0YXJ0X3ByaWNlAAAAAAs=",
        "AAAAAQAAAAAAAAAAAAAAA0JldAAAAAADAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABGhpbG8AAAfQAAAABEhpTG8AAAAAAAAAA3R0bAAAAAAG",
        "AAAAAAAAAAAAAAAEaW5pdAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAGb3JhY2xlAAAAAAATAAAAAAAAAAVhc3NldAAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAARoYXNoAAAD7gAAACAAAAAA",
        "AAAAAAAAAAAAAAALc3RhcnRfcm91bmQAAAAAAgAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAAAAAApleHBpcmF0aW9uAAAAAAAGAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAADYmV0AAAAAAQAAAAAAAAABnBsYXllcgAAAAAAEwAAAAAAAAACaWQAAAAAAAQAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAEaGlsbwAAB9AAAAAESGlMbwAAAAEAAAfQAAAABVJvdW5kAAAA",
        "AAAAAAAAAAAAAAAFY2xhaW0AAAAAAAACAAAAAAAAAAZwbGF5ZXIAAAAAABMAAAAAAAAAAmlkAAAAAAAEAAAAAQAAAAs=",
        "AAAAAAAAAAAAAAAMX19jaGVja19hdXRoAAAAAwAAAAAAAAASX3NpZ25hdHVyZV9wYXlsb2FkAAAAAAPuAAAAIAAAAAAAAAALX3NpZ25hdHVyZXMAAAAD6AAAA+oAAAAAAAAAAAAAAA5fYXV0aF9jb250ZXh0cwAAAAAD6gAAB9AAAAAHQ29udGV4dAAAAAABAAAD6QAAA+0AAAAAAAAAAw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
        upgrade: this.txFromJSON<null>,
        start_round: this.txFromJSON<u32>,
        bet: this.txFromJSON<Round>,
        claim: this.txFromJSON<i128>
  }
}