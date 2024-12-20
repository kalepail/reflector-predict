# Contract
# CAPJOXO34SH5KDUV3RGPXJABN63MOYX7W5TMFYRDU6VJBZPBY2NZII7F

# Oracle
# CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63

# Asset
# CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

default: build

all: test

test: build
	cargo test

build:
	stellar contract build

optimize:
	stellar contract optimize --wasm target/wasm32-unknown-unknown/release/reflector_predict.wasm

deploy:
	stellar contract deploy --wasm target/wasm32-unknown-unknown/release/reflector_predict.optimized.wasm --network testnet --source default -- --admin default --oracle CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63 --asset CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

bindings-oracle:
	stellar contract bindings typescript --network testnet --output-dir ./bun_scripts/reflector-oracle-sdk --contract-id CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63 --overwrite

bindings-predict:
	stellar contract bindings typescript --wasm target/wasm32-unknown-unknown/release/reflector_predict.optimized.wasm --output-dir ./bun_scripts/reflector-predict-sdk --contract-id CAPJOXO34SH5KDUV3RGPXJABN63MOYX7W5TMFYRDU6VJBZPBY2NZII7F --overwrite

fmt:
	cargo fmt --all

clean:
	cargo clean

snapshot:
	rm -rf snapshot.json
	stellar snapshot create --network mainnet --output json --address CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN