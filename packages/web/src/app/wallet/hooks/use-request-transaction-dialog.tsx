import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { isAddress } from "viem";
import { useToast } from "@/hooks/use-toast";
import useListenStatus from "./use-listen-status";
import AmountInput, { parseAmount } from "@/components/amount-input";
import { createAmountZodSchema, isWalletId } from "../utils";
import { Textarea } from "@/components/ui/textarea";
import useWriteContract from "@/hooks/use-write-contract";
import useContract from "@/hooks/use-contract";

const formSchema = z.object({
  address: z.custom<string>((address) => isAddress(address), "Invalid address"),
  amount: createAmountZodSchema(),
  description: z.string(),
});

const useRequestTransactionDialog = () => {
  const [contractAddress, abi] = useContract("Wallet");
  const [open, setOpen] = useState(false);
  const walletIdRef = useRef<string>();
  const writeContract = useWriteContract();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: { unit: "wei" },
      description: "",
    },
  });
  const { toast } = useToast();

  const [wrap, { onSuccess, onError }] = useListenStatus({
    initialErrorCallback: (err) => {
      toast({
        variant: "destructive",
        title: "Request Transaction failed",
        description:
          err?.cause?.data?.errorName ??
          err?.cause?.shortMessage ??
          "Please check your input and try again.",
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isWalletId(walletIdRef.current ?? "")) {
      return toast({
        variant: "destructive",
        title: "Invalid wallet address",
        description: "Please select a wallet",
      });
    }

    return wrap(
      writeContract({
        abi,
        address: contractAddress,
        functionName: "requestTransaction",
        args: [
          walletIdRef.current as `0x${string}`,
          values.address as `0x${string}`,
          parseAmount(values.amount),
          values.description,
        ],
      }).then(() => {
        setOpen(false);
      })
    );
  };

  const element = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Request Transaction</DialogTitle>
          <DialogDescription>
            Please enter address and amount to request a transaction.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Please enter address" {...field} />
                  </FormControl>
                  <FormDescription>This is target address.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <AmountInput placeholder="Please enter amount" {...field} />
                  </FormControl>
                  <FormDescription>This is amount to transfer.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Please enter amount" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is description to transfer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" loading={form.formState.isSubmitting}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const openDialog = (id: string) => {
    setOpen(true);
    walletIdRef.current = id;
  };

  const closeDialog = () => {
    setOpen(false);
    walletIdRef.current = undefined;
  };

  useEffect(() => {
    form.reset();
  }, [open]);

  return [element, openDialog, closeDialog, { onSuccess, onError }] as const;
};

export default useRequestTransactionDialog;
