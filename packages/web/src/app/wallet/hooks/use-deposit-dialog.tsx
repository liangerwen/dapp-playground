import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import useListenStatus from "./use-listen-status";
import { toast } from "@/hooks/use-toast";
import AmountInput, { parseAmount } from "@/components/amount-input";
import { createAmountZodSchema } from "../utils";
import useWriteContract from "@/hooks/use-write-contract";
import useContract from "@/hooks/use-contract";

const formSchema = z.object({
  amount: createAmountZodSchema(true),
});

const useDepositDialog = () => {
  const [open, setOpen] = useState(false);
  const walletIdRef = useRef<string>();
  const writeContract = useWriteContract();
  const [contractAddress, abi] = useContract("WalletModule#Wallet");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: { unit: "wei" },
    },
  });

  const [wrap, { onSuccess, onError }] = useListenStatus({
    initialErrorCallback: (err) => {
      toast({
        variant: "destructive",
        title: "Deposit failed",
        description:
          err?.cause?.data?.errorName ??
          err?.cause?.shortMessage ??
          "Please check your input and try again.",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) =>
    wrap(
      writeContract({
        abi,
        address: contractAddress,
        functionName: "deposit",
        value: parseAmount(values.amount),
        args: [walletIdRef.current as `0x${string}`],
      }).then(() => {
        setOpen(false);
      })
    );

  const element = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Deposit to Wallet</DialogTitle>
          <DialogDescription>
            Please enter the details to deposit to your wallet.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

export default useDepositDialog;
