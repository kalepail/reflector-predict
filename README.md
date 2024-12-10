# Reflector Predict

Bet on the price movements of Reflector oracle assets.
* Currently on Testnet only: `CDQII2BQRWATHWPMJA4L7EIEPCUFIX5ILGQQQKCI27HBDH2BQOBTSVLZ`
* Utilizing the Reflector testnet contract: `CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63`
* Bet `amount` is denoted in stroops
* Rounds are currently hard-coded to close 5 minutes after they are started
* If the price of an asset is equal to the previous price at the close of a round the low bets will win

## Build

```bash
cd bun_scripts
bun install
bun run build:all
```

## Link from source

```bash
cd bun_scripts
bun link
bun link betn
```

## Use

### Help

```bash
betn -h
```
```bash
betn

Commands:
  betn login            Login with your Stellar account
  betn assets           List all available assets
  betn bet <command>    Manage bets
  betn round <command>  Manage rounds
  betn                                                                 [default]

Options:
  -h, --help  Show help                                                [boolean]
```

### Login

```bash
betn login
```
```bash
Enter your Stellar secret key: SD3CB...U7MJZ
```
```bash
┌──────────────────────┬──────────────────────────────────────────────────────────┐
│ id                   │ GBNFW7VNE5ANKOZJTTDK3Z7CIF4JOY6NJVGUCTKYB5LK4YSNGFFTFQOL │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ balance              │ 10000.0000000 XLM                                        │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ sequence             │ 11403138170880                                           │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ last_modified_ledger │ 2655                                                     │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ last_modified_time   │ 2024-12-10T20:59:53Z                                     │
└──────────────────────┴──────────────────────────────────────────────────────────┘
```

### List assets

```bash
betn assets
```
```bash
┌────────┐
│ Assets │
├────────┤
│ BTC    │
├────────┤
│ ETH    │
├────────┤
│ USDT   │
├────────┤
│ XRP    │
├────────┤
│ SOL    │
├────────┤
│ USDC   │
├────────┤
│ ADA    │
├────────┤
│ AVAX   │
├────────┤
│ DOT    │
├────────┤
│ MATIC  │
├────────┤
│ LINK   │
├────────┤
│ DAI    │
├────────┤
│ ATOM   │
├────────┤
│ XLM    │
├────────┤
│ UNI    │
├────────┤
│ EURC   │
└────────┘
```

### Round Start

Start a new round with a new `round` id.

```bash
betn round start --asset BTC
```
```bash
Round 1 started for BTC
```

### Round Lookup

Lookup the details of a `round`.

```bash
betn round lookup --round 1
```
```bash
┌───────────────┬─────────────────────┐
│ amount_higher │ 100                 │
├───────────────┼─────────────────────┤
│ amount_lower  │ 0                   │
├───────────────┼─────────────────────┤
│ asset         │ BTC                 │
├───────────────┼─────────────────────┤
│ end_price     │ null                │
├───────────────┼─────────────────────┤
│ expiration    │ 1733867071          │
├───────────────┼─────────────────────┤
│ share_higher  │ 24000               │
├───────────────┼─────────────────────┤
│ share_lower   │ 0                   │
├───────────────┼─────────────────────┤
│ start_price   │ 9704251242451671708 │
└───────────────┴─────────────────────┘
```

### Round Claim

Claim any rewards for a `round` you've won.

```bash
betn round claim --round 1
```
```bash
Won 100 for round 1
```

### Bet Place

Place a bet on a `round` for an `amount` betting either `hi` or `lo`.

```bash
betn bet place --round 1 --amount 100 --hilo hi
```
```bash
┌───────────────┬─────────────────────┐
│ amount_higher │ 100                 │
├───────────────┼─────────────────────┤
│ amount_lower  │ 0                   │
├───────────────┼─────────────────────┤
│ asset         │ BTC                 │
├───────────────┼─────────────────────┤
│ end_price     │ undefined           │
├───────────────┼─────────────────────┤
│ expiration    │ 1733867071          │
├───────────────┼─────────────────────┤
│ share_higher  │ 24100               │
├───────────────┼─────────────────────┤
│ share_lower   │ 0                   │
├───────────────┼─────────────────────┤
│ start_price   │ 9704251242451671708 │
└───────────────┴─────────────────────┘
```

### Bet Lookup

Lookup the details of a `bet`.

```bash
betn bet lookup --round 1
```
```bash
┌────────┬────────┐
│ amount │ 100    │
├────────┼────────┤
│ hilo   │ Higher │
├────────┼────────┤
│ ttl    │ 240    │
└────────┴────────┘
```
