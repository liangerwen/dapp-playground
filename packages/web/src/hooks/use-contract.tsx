import contracts, { ChainId, ContractName } from "@/constants/contracts";
import { useAccount } from "wagmi";

const useContract = (name: ContractName) => {
  const { chainId } = useAccount();
  const contract = contracts?.[chainId as ChainId]?.[name];
  return [contract?.address, contract?.abi] as const;
};

export default useContract;
