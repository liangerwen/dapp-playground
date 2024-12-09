"use client";

import Tooltip from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { TextSearch, Wallet as WalletIcon } from "lucide-react";
import {
  useAccount,
  useConfig,
  useReadContract,
  useWatchContractEvent,
} from "wagmi";
import { abi, getContractAddress } from "./abi";
import { useEffect } from "react";
import type { Wallet, WalletCreatedArgs } from "./interface";
import { formatObjFromSolidity } from "@/lib/utils";
import useNewWalletDialog from "./hooks/use-new-wallet-dialog";
import useRequestTransactionDialog from "./hooks/use-request-transaction-dialog";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import useDepositDialog from "./hooks/use-deposit-dialog";
import { walletMap } from "./utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import useHistorySheet from "./hooks/use-history-sheet";
import Loading from "@/components/loading";
import { formatEther } from "viem";

const WalletPage = () => {
  const { address, chainId, isConnecting, isReconnecting } = useAccount();
  const config = useConfig();
  const { openConnectModal } = useConnectModal();
  const {
    data,
    refetch: refetchWallets,
    isLoading,
  } = useReadContract({
    abi,
    address: getContractAddress(chainId),
    functionName: "getUserWallets",
    account: address,
    query: {
      enabled: !!address,
    },
  });

  const wallets = formatObjFromSolidity<Wallet[]>(data ?? []);

  useWatchContractEvent({
    address: getContractAddress(chainId),
    abi,
    onLogs(logs) {
      logs.forEach((log) => {
        if (
          log.eventName === "WalletCreated" &&
          !wallets.find(
            (i) => i.id === (log.args as WalletCreatedArgs)?.walletId
          )
        ) {
          refetchWallets();
        }
      });
    },
  });

  const [
    newWalletFormDialogElement,
    openNewWalletFormDialog,
    ,
    { onSuccess: onNewWalletCreated },
  ] = useNewWalletDialog();
  const [requestTransactionDialogElement, openRequestTransactionDialog] =
    useRequestTransactionDialog();
  const [
    depositDialogElement,
    openDepositDialog,
    ,
    { onSuccess: onDepositSuccess },
  ] = useDepositDialog();
  const [historySheetElement, openHistorySheet] = useHistorySheet();

  onNewWalletCreated(() => {
    refetchWallets();
  });

  onDepositSuccess(() => {
    refetchWallets();
  });

  useEffect(() => {
    refetchWallets();
  }, [config, address, chainId]);

  if (!address) {
    return (
      <div className="size-full flex justify-center items-center">
        {isConnecting || isReconnecting ? (
          <p>Connecting...</p>
        ) : (
          <>
            <span>Please connect your wallet,</span>
            <Button
              onClick={() => openConnectModal?.()}
              variant="link"
              className="text-blue-600"
            >
              Connect =&gt;
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <Loading loading={isLoading}>
      <div className="bg-background size-full rounded-md p-4 shadow-sm">
        <div className="flex justify-end">
          <Button onClick={() => openNewWalletFormDialog()}>
            <WalletIcon />
            New Wallet
          </Button>
        </div>
        {wallets.length === 0 ? (
          <div className="size-full flex flex-col justify-center items-center text-gray-500">
            <TextSearch size={96} />
            <p>No wallets found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mt-4">
            {formatObjFromSolidity<Wallet[]>(wallets).map((i) => (
              <Card className="w-max-full overflow-hidden" key={i.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <h3>{i.name}</h3>
                    <span className="font-normal text-sm">
                      {formatEther(BigInt(i.balance))} ETH
                    </span>
                  </CardTitle>
                  <Tooltip title={i.id}>
                    <CardDescription className="text-ellipsis overflow-hidden">
                      {i.id}
                    </CardDescription>
                  </Tooltip>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Label>type</Label>
                    <Badge variant="secondary">{walletMap[i.walletType]}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>members</Label>
                    <Badge variant="secondary">{i.owners.length}</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-col gap-4 w-full">
                    <Button
                      variant="secondary"
                      className="w-full block"
                      size="sm"
                      onClick={() => openRequestTransactionDialog(i.id)}
                    >
                      Request Transaction
                    </Button>
                    <div className="flex gap-4 w-full">
                      <Button
                        variant="outline"
                        className="flex-1 p-0"
                        size="sm"
                        onClick={() => openHistorySheet(i.id)}
                      >
                        History
                      </Button>
                      <Button
                        className="flex-1 p-0"
                        size="sm"
                        onClick={() => openDepositDialog(i.id)}
                      >
                        Deposit
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {newWalletFormDialogElement}
        {requestTransactionDialogElement}
        {depositDialogElement}
        {historySheetElement}
      </div>
    </Loading>
  );
};

export default WalletPage;
