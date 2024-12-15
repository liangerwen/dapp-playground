import { HardhatUserConfig } from "hardhat/config";
import { parseEther } from "ethers";
import "@nomicfoundation/hardhat-ignition-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
      ],
    },
    hardhat: {
      accounts: [
        {
          privateKey:
            "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
          balance: parseEther("1000").toString(),
        },
        {
          privateKey:
            "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
          balance: parseEther("1000").toString(),
        },
        {
          privateKey:
            "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
          balance: parseEther("1000").toString(),
        },
      ],
    },
    // holesky: {
    //   url: "https://ethereum-holesky-rpc.publicnode.com",
    //   accounts: [process.env.PRIVATE_KEY!],
    //   chainId: 17000,
    // },
    // sepolia: {
    //   url: "https://ethereum-sepolia-rpc.publicnode.com",
    //   accounts: [process.env.PRIVATE_KEY!],
    //   chainId: 11155111,
    // },
  },
};

export default config;
