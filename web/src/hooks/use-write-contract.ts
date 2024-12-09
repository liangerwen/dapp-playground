import { simulateContract } from "@wagmi/core";
import {
  useConfig,
  UseWriteContractReturnType,
  useWriteContract as wagmiUseWriteContract,
} from "wagmi";

type SimulateContractOption = Parameters<typeof simulateContract>[1];

const useWriteContract = () => {
  const config = useConfig();
  const { writeContractAsync } = wagmiUseWriteContract();

  const writeContract: UseWriteContractReturnType["writeContractAsync"] = (
    params
  ) => {
    return simulateContract(config, params as SimulateContractOption).then(() =>
      writeContractAsync(params)
    );
  };

  return writeContract;
};

export default useWriteContract;
