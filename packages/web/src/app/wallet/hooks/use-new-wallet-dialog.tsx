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
import { useEffect, useState } from "react";
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
import useListenStatus from "./use-listen-status";
import InputList from "@/components/input-list";
import { toast } from "@/hooks/use-toast";
import AmountInput, { parseAmount } from "@/components/amount-input";
import { createAmountZodSchema } from "../utils";
import useWriteContract from "@/hooks/use-write-contract";
import useContract from "@/hooks/use-contract";

const formSchema = z
  .object({
    owners: z
      .array(
        z.custom<string>((address) => !!isAddress(address), {
          message: "Invalid address",
        }),
        { message: "Invalid address" }
      )
      .refine((items) => new Set(items).size === items.length, {
        message: "Owners should not have duplicates",
      }),
    needComfirmCount: z.coerce
      .number()
      .int("Confirm number should be an integer")
      .gt(0, "Confirm number should be greater than 0"),
    name: z.string().min(1, "Name should not be empty"),
    amount: createAmountZodSchema(),
  })
  .refine((data) => data.needComfirmCount <= data.owners.length, {
    message: "Confirm number should be greater than or equal to owners number",
    path: ["needComfirmCount"],
  });

const useNewWalletDialog = () => {
  const [contractAddress, abi] = useContract("WalletModule#Wallet");
  const [open, setOpen] = useState(false);
  const writeContract = useWriteContract();
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
        title: "New wallet failed",
        description:
          err?.cause?.data?.errorName ??
          err?.cause?.shortMessage ??
          "Please check your input and try again.",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    return wrap(
      writeContract({
        abi,
        address: contractAddress,
        functionName: "createWallet",
        value: parseAmount(values.amount),
        args: [
          values.owners as `0x${string}`[],
          values.name,
          BigInt(values.needComfirmCount),
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
          <DialogTitle>New Wallet</DialogTitle>
          <DialogDescription>
            Please enter the details of the new wallet.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Please enter name" {...field} />
                  </FormControl>
                  <FormDescription>This is wallet name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owners"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owners</FormLabel>
                  <FormControl>
                    <InputList placeholder="Please enter address" {...field} />
                  </FormControl>
                  <FormDescription>This is owners address.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="needComfirmCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Need Confirm Count</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please enter confirm number"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>This is confirm number.</FormDescription>
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

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  useEffect(() => {
    form.reset();
  }, [open]);

  return [element, openDialog, closeDialog, { onSuccess, onError }] as const;
};

export default useNewWalletDialog;
