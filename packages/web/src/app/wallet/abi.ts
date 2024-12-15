export const abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "Wallet__AmountCannotBeZero",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__ConfirmNumCannotMoreThanOwners",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__ConfirmNumIsRequired",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__NotEnoughBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__OnlyOwnner",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__OnlyRequestorCanCancel",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__OnlyRequestorCanSend",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__OwnersIsRequired",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__RequestorCannotConfirm",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__TransactionAlreadyConfirmed",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__TransactionAlreadySent",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__TransactionIsCanceled",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__TransactionNotConfirmed",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__TransactionNotExists",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__TransactionSendFailed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "walletId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "DepositAmount",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "walletId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "transactionId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "TransactionCanceled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "walletId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "transactionId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "enum Wallet.ConfirmStatus",
        name: "status",
        type: "uint8",
      },
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "TransactionConfirmed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "walletId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "transactionId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "TransactionRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "walletId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "transactionId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "TransactionSend",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "walletId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "enum UserWalletStorage.WalletType",
        name: "walletType",
        type: "uint8",
      },
      {
        indexed: true,
        internalType: "address[]",
        name: "owners",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "needComfirmCount",
        type: "uint256",
      },
    ],
    name: "WalletCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_walletId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_transactionId",
        type: "bytes32",
      },
    ],
    name: "cancelTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_walletId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_transactionId",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "_confirm",
        type: "bool",
      },
    ],
    name: "confirmTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_owners",
        type: "address[]",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_needComfirmCount",
        type: "uint256",
      },
    ],
    name: "createWallet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_walletId",
        type: "bytes32",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getUserWallets",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "enum UserWalletStorage.WalletType",
            name: "walletType",
            type: "uint8",
          },
          {
            internalType: "address[]",
            name: "owners",
            type: "address[]",
          },
          {
            internalType: "uint256",
            name: "balance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "needComfirmCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct UserWalletStorage.UserWallet[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_walletId",
        type: "bytes32",
      },
    ],
    name: "getWalletDeposits",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct Wallet.Deposit[]",
        name: "deposits",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_walletId",
        type: "bytes32",
      },
    ],
    name: "getWalletTransactions",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "id",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "enum WalletTransactionStorage.TransactionStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "confirmedCount",
            type: "uint256",
          },
        ],
        internalType: "struct WalletTransactionStorage.Transaction[]",
        name: "",
        type: "tuple[]",
      },
      {
        internalType: "enum Wallet.ConfirmStatus[]",
        name: "",
        type: "uint8[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_walletId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
    ],
    name: "requestTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_walletId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_transactionId",
        type: "bytes32",
      },
    ],
    name: "sendTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const getContractAddress = (chainId?: number) => {
  const contractAddressMap = {
    17000: process.env
      .NEXT_PUBLIC_WALLET_HOLESKY_CONTRACT_ADDRESS as `0x${string}`,
    11155111: process.env
      .NEXT_PUBLIC_WALLET_SEPOLIA_CONTRACT_ADDRESS as `0x${string}`,
    31337: process.env
      .NEXT_PUBLIC_WALLET_HARDHAT_CONTRACT_ADDRESS as `0x${string}`,
  };
  return (
    contractAddressMap[chainId as 17000 | 11155111 | 31337] ??
    contractAddressMap["31337"]
  );
};
