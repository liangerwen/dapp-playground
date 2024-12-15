import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { abi, getContractAddress } from "../abi";
import { formatObjFromSolidity } from "@/lib/utils";
import { TabsContent, TabsList, Tabs, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatEther } from "viem";
import {
  ConfirmStatus,
  Deposit,
  Transaction,
  TransactionStatus,
} from "../interface";
import Tooltip from "@/components/tooltip";
import Loading from "@/components/loading";
import { TransactionStatusLabel } from "../constants";
import { TextSearch } from "lucide-react";
import useWriteContract from "@/hooks/use-write-contract";
import useListenStatus from "./use-listen-status";

/**
 * TODO:
 * 1. transations & deposits styles
 * 2. comfirm transation
 */

const useHistorySheet = () => {
  const { chainId } = useAccount();
  const [open, setOpen] = useState(false);
  const walletIdRef = useRef<string>();
  const { address } = useAccount();
  const {
    data: transactionHistory,
    refetch: refetchTransactionHistory,
    isLoading: loadingTransactionHistory,
  } = useReadContract({
    abi,
    address: getContractAddress(chainId),
    functionName: "getWalletTransactions",
    account: address,
    query: {
      enabled: !!address && !!walletIdRef.current,
    },
    args: [walletIdRef.current as `0x${string}`],
  });
  const {
    data: depositHistory,
    refetch: refetchDepositHistory,
    isLoading: loadingDepositHistory,
  } = useReadContract({
    abi,
    address: getContractAddress(chainId),
    functionName: "getWalletDeposits",
    account: address,
    query: {
      enabled: !!address && !!walletIdRef.current,
    },
    args: [walletIdRef.current as `0x${string}`],
  });
  const writeContract = useWriteContract();

  const { toast } = useToast();

  const [type, setType] = useState("all");

  const deposits = formatObjFromSolidity<Deposit[]>(depositHistory ?? []);

  const [wrap] = useListenStatus({
    initialErrorCallback: (err) => {
      toast({
        variant: "destructive",
        title: "Failed",
        description:
          err?.cause?.data?.errorName ??
          err?.cause?.shortMessage ??
          "Please try again.",
      });
    },
  });

  const transactions = useMemo(() => {
    let t = formatObjFromSolidity<Transaction[]>(transactionHistory?.[0] ?? []);
    const confirms = transactionHistory?.[1] ?? [];
    t = t
      .map((i, idx) => ({
        ...i,
        selfConfirmStatus: confirms[idx],
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
    if (type === "your request") {
      t = t.filter((i) => i.from === address);
    }
    if (type === "awaiting your confirmation") {
      t = t.filter(
        (i) =>
          i.status === TransactionStatus.REQUESTED &&
          i.from !== address &&
          i.selfConfirmStatus === ConfirmStatus.WAIT
      );
    }
    return t;
  }, [type, transactionHistory]);

  const refetch = () => {
    refetchTransactionHistory();
    refetchDepositHistory();
  };

  useEffect(() => {
    if (open && address && walletIdRef.current) {
      refetch();
    }
  }, [open]);

  const renderFooter = (transaction: Transaction) => {
    const disabled = [
      TransactionStatus.SENT,
      TransactionStatus.CANCELED,
    ].includes(transaction.status);
    const tooltip = disabled ? "Transaction is already sent or aborted" : "";
    if (transaction.from === address) {
      const notConfirmed = transaction.status === TransactionStatus.REQUESTED;
      return (
        <>
          <Tooltip
            title={notConfirmed ? "Transaction is not confirmed yet" : tooltip}
          >
            <Button
              size="sm"
              className="w-full"
              disabled={disabled || notConfirmed}
              onClick={() =>
                wrap(
                  writeContract({
                    abi,
                    address: getContractAddress(chainId),
                    functionName: "sendTransaction",
                    args: [
                      walletIdRef.current as `0x${string}`,
                      transaction.id as `0x${string}`,
                    ],
                  }).then(() => refetchTransactionHistory())
                )
              }
            >
              Send
            </Button>
          </Tooltip>
          <Tooltip title={tooltip}>
            <Button
              size="sm"
              className="w-full"
              variant="destructive"
              disabled={disabled}
              onClick={() =>
                wrap(
                  writeContract({
                    abi,
                    address: getContractAddress(chainId),
                    functionName: "cancelTransaction",
                    args: [
                      walletIdRef.current as `0x${string}`,
                      transaction.id as `0x${string}`,
                    ],
                  }).then(() => refetchTransactionHistory())
                )
              }
            >
              Abort
            </Button>
          </Tooltip>
        </>
      );
    }
    const selfHasConfirmed =
      transaction.selfConfirmStatus !== ConfirmStatus.WAIT;
    return (
      <>
        <Tooltip
          title={
            selfHasConfirmed
              ? "You have already confirmed this transaction"
              : tooltip
          }
        >
          <Button
            size="sm"
            className="w-full"
            disabled={disabled || selfHasConfirmed}
            onClick={() =>
              wrap(
                writeContract({
                  abi,
                  address: getContractAddress(chainId),
                  functionName: "confirmTransaction",
                  args: [
                    walletIdRef.current as `0x${string}`,
                    transaction.id as `0x${string}`,
                    true,
                  ],
                }).then(() => refetchTransactionHistory())
              )
            }
          >
            Agree
          </Button>
        </Tooltip>
        <Tooltip
          title={
            selfHasConfirmed
              ? "You have already confirmed this transaction"
              : tooltip
          }
        >
          <Button
            size="sm"
            className="w-full"
            variant="destructive"
            disabled={disabled || selfHasConfirmed}
            onClick={() =>
              wrap(
                writeContract({
                  abi,
                  address: getContractAddress(chainId),
                  functionName: "confirmTransaction",
                  args: [
                    walletIdRef.current as `0x${string}`,
                    transaction.id as `0x${string}`,
                    false,
                  ],
                }).then(() => refetchTransactionHistory())
              )
            }
          >
            Reject
          </Button>
        </Tooltip>
      </>
    );
  };

  const element = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex flex-col w-[30rem] sm:max-w-[80vw]"
      >
        <SheetHeader>
          <SheetTitle>Transaction History</SheetTitle>
        </SheetHeader>

        <Tabs
          defaultValue="transactions"
          className="pt-2 flex-1 overflow-auto flex flex-col"
        >
          <TabsList className="w-full">
            <TabsTrigger value="transactions" className="flex-1">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex-1">
              Deposits
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="transactions"
            className="flex-1 overflow-auto flex"
          >
            <div className="flex flex-col gap-4 break-all flex-1">
              <Loading
                loading={loadingTransactionHistory}
                className="self-center"
              >
                <ToggleGroup
                  type="single"
                  className="w-fit self-end"
                  onValueChange={setType}
                  value={type}
                >
                  <ToggleGroupItem value="all">All</ToggleGroupItem>
                  <ToggleGroupItem value="your request">
                    Your Request
                  </ToggleGroupItem>
                  <ToggleGroupItem value="awaiting your confirmation">
                    Awaiting Your Confirmation
                  </ToggleGroupItem>
                </ToggleGroup>
                {transactions.length === 0 ? (
                  <div className="size-full flex flex-col justify-center items-center text-gray-500 mt-20">
                    <TextSearch size={96} />
                    <p>No transactions found.</p>
                  </div>
                ) : (
                  transactions.map((i) => (
                    <Card key={i.id}>
                      <CardHeader>
                        <CardTitle># {i.id}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label>from</Label>
                          <Badge variant="secondary">{i.from}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>to</Label>
                          <Badge variant="secondary">{i.to}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>amount</Label>
                          <Badge variant="secondary">
                            {formatEther(i.amount)} ETH
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>confirmed count</Label>
                          <Badge variant="secondary">{i.confirmedCount}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>status</Label>
                          <Badge variant="secondary">
                            {TransactionStatusLabel[i.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>description</Label>
                          <span className="text-sm">{i.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>request time</Label>
                          <Badge variant="secondary">{i.timestamp}</Badge>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="grid grid-cols-2 gap-4 w-full">
                          {renderFooter(i)}
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </Loading>
            </div>
          </TabsContent>
          <TabsContent value="deposits" className="flex-1 overflow-auto">
            <div className="flex flex-col gap-4 break-all">
              <Loading loading={loadingDepositHistory}>
                {deposits.length === 0 ? (
                  <div className="size-full flex flex-col justify-center items-center text-gray-500 mt-20">
                    <TextSearch size={82} />
                    <p>No deposits found.</p>
                  </div>
                ) : (
                  deposits.map((i) => (
                    <Card key={i.id}>
                      <CardHeader>
                        <CardTitle># {i.id}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label>sender</Label>
                          <Badge variant="secondary">{i.owner}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>amount</Label>
                          <Badge variant="secondary">
                            {formatEther(i.amount)} ETH
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>time</Label>
                          <Badge variant="secondary">{i.timestamp}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Loading>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );

  const openSheet = (id: string) => {
    if (!address) {
      return toast({
        variant: "destructive",
        title: "Error",
        description: "You need to connect your wallet first",
      });
    }
    setOpen(true);
    walletIdRef.current = id;
  };

  const closeSheet = () => {
    setOpen(false);
    walletIdRef.current = undefined;
  };

  return [element, openSheet, closeSheet] as const;
};

export default useHistorySheet;
