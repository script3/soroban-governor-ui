# Soroban Governor UI

An open soruce interface for interacting with Soroban Governor based contracts.

For information about Soroban Governor, see the [Governor Contracts repository](https://github.com/script3/soroban-governor).

## Getting Started

The Governor UI supports an internally defined list of Governor contracts. There is a `governors-mainnet.json` and `governors-testnet.json` included that represent the included Governor contracts used on the deployed versions at [governance.script3.io](https://governance.script3.io).

The build command also defines an environment file, with information about indexed tables, the RPC URL, and network information. You can change the RPC URL to any valid Stellar RPC that supports the network defined by `NEXT_PUBLIC_PASSPHRASE`.

To build the UI for testnet using `governors-testnet.json` and `.env.testnet`, run:

```bash
npm run build:testnet
```

To build the UI for mainnet using `governors-mainnet.json` and `.env.production`, run:

```bash
npm run build:mainnet
```

Both of these build commands will output files into `./out`, and can be served locally by a http server:

```bash
http-server ./out
```

## Contributing

Contributions are welcome. If there is something you would like to see updated, please submit a pull request.
