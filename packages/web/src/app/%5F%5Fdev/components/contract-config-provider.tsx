import { createContext, useContext } from "react";
import { Abi, Address, zeroAddress } from "viem";

export interface ContractConfig {
  address: Address;
  abi: Abi;
  inheritedFunctions: Record<string, string>;
}

const ContractConfigContext = createContext<ContractConfig>({
  address: zeroAddress,
  abi: [],
  inheritedFunctions: {},
});

export const useContractConfig = () => useContext(ContractConfigContext);

export default ContractConfigContext.Provider;
