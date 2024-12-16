## Dapp Playground

This is a playground for developing decentralized applications (dapps) using various blockchain technologies.For study use only.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.18)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Dapp playground, follow the steps below:

1. Clone the repository:

```
git clone https://github.com/liangerwen/dapp-playground.git
```

2. Install dependencies:

```
cd dapp-playground
yarn
```

3. Configure your environment variables:

    3.1 Create a `.env` file in the packages/web directory, the example of `.env` file is: `.example.env`
    3.2 Create a `.env` file in the packages/smart-contracts directory, the example of `.env` file is: `.example.env`

4. Start hardhat network and web app:

```
yarn dev
```

5. Deploy your smart contract to the hardhat network:

```
yarn deploy --network localhost
```

Visit your app on: `http://localhost:3000`.

### The License is MIT.
