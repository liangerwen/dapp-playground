// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NfttModule = buildModule("NftModule", (m) => {
  const deployer = m.getAccount(0);
  const nft = m.contract("MyNFT");
  m.call(
    nft,
    "mint",
    [BigInt(1), "ipfs://QmasKCMAahjHWGkgHFSM4YFBRdJKsHCcGdoSJGc5n1xTvK"],
    {
      from: deployer,
    }
  );
  return { nft };
});

export default NfttModule;
