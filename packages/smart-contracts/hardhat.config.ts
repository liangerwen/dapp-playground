import { HardhatUserConfig } from "hardhat/config";
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
