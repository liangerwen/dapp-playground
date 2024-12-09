import { z } from "zod";

export const createAmountZodSchema = (required = false) =>
  z.object({
    value: z.custom((amount) => {
      const vaildAmount = /^[0-9]\d*(\.\d+)?$|^[1-9]\d*\.\d+$/.test(amount);
      if (required) {
        return vaildAmount;
      }
      return vaildAmount || amount === undefined;
    }, "Invalid amount"),
    unit: z.enum(["gwei", "wei", "ether"]),
  });

export const walletMap = {
  0: "Single",
  1: "Multi",
};

export const isWalletId = (id: string) => /^0x[a-fA-F0-9]{64}$/.test(id);
