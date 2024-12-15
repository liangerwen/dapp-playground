import { simulateContract, waitForTransactionReceipt } from "@wagmi/core";
import {
  useConfig,
  UseWriteContractReturnType,
  useWriteContract as wagmiUseWriteContract,
} from "wagmi";
import { useToast } from "@/hooks/use-toast";
import { Shell } from "lucide-react";

type SimulateContractOption = Parameters<typeof simulateContract>[1];

const useWriteContract = () => {
  const config = useConfig();
  const { writeContractAsync } = wagmiUseWriteContract();
  const { toast } = useToast();

  const writeContract: UseWriteContractReturnType["writeContractAsync"] =
    async (params) => {
      await simulateContract(config, params as SimulateContractOption);
      const res = await writeContractAsync(params);
      const { dismiss } = toast({
        description: (
          <div className="flex items-center gap-2">
            <Shell size={14} className="animate-spin" />
            <span>wait for transaction receipt...</span>
          </div>
        ),
        duration: 15000,
      });
      await waitForTransactionReceipt(config, { hash: res });
      dismiss();
      return res;
    };

  return writeContract;
};

export default useWriteContract;
