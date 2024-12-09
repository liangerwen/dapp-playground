export interface Wallet {
  id: string;
  name: string;
  walletType: WalletType;
  balance: string;
  needComfirmCount: number;
  owners: string[];
}

export interface Transaction {
  id: string;
  wallet: string;
  index: number;
  from: string;
  to: string;
  amount: bigint;
  timestamp: number;
  status: TransactionStatus;
  confirmedCount: number;
  description: string;
  selfConfirmStatus?: number;
}

export interface Deposit {
  id: string;
  owner: string;
  amount: bigint;
  timestamp: number;
}

export enum WalletType {
  SINGLE,
  MULTIPLE,
}

export enum TransactionStatus {
  REQUESTED,
  CONFIRMED,
  CANCELED,
  SENT,
}

export enum ConfirmStatus {
  WAIT,
  AGREE,
  REJECT,
}

export interface WalletCreatedArgs {
  walletId: string;
  from: `0x${string}`;
  transactionIndex: bigint;
  timestamp: bigint;
}
