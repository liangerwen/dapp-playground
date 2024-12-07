## Dapp Playground

This is a playground for developing decentralized applications (dapps) using various blockchain technologies.For study use only.

### smart-contracts

```
cd smart-contracts

yarn

// dev => copy your contract address
yarn build:dev

// test
yarn hardhat test

// holesky => copy your contract address
yarn build:holesky

// sepolia => copy your contract address
yarn build:sepolia

```

### web

```
cd web

yarn

// parse your contract address to .env file (need to touch .env file first) => NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
// input your project id to .env file (need to touch .env file first & create your project id on https://cloud.walletconnect.com) => NEXT_PUBLIC_PROJECT_ID=...

// dev
yarn start:dev

// build
yarn build

// start
yarn start
```

### The License is MIT.