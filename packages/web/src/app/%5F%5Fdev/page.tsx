"use client";

import { __DEV__ } from "@/constants";
import contracts, { ChainId } from "@/constants/contracts";
import { notFound } from "next/navigation";
import { useAccount } from "wagmi";

const Dev = () => {
  const { chainId = 31337 } = useAccount();
  const currentContracts = contracts[chainId as ChainId];

  if (!__DEV__) {
    return notFound();
  }

  return (
    <div>
      {Object.entries(currentContracts).map(
        ([name, { address, abi, inheritedFunctions }]) => (
          <div key={name}>
            {name}
            <br />
            <div>{address}</div>
            <br />
            <div>{JSON.stringify(abi)}</div>
            <br />
            <div>{JSON.stringify(inheritedFunctions)}</div>
          </div>
        )
      )}
    </div>
  );
};

export default Dev;
