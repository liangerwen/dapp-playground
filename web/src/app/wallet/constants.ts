import { TransactionStatus } from "./interface";

export const TransactionStatusLabel = {
  [TransactionStatus.REQUESTED]: "Requested",
  [TransactionStatus.CONFIRMED]: "Confirmed",
  [TransactionStatus.CANCELED]: "Canceled",
  [TransactionStatus.SENT]: "Sent",
};
