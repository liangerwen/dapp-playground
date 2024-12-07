import { expect } from "chai";
import { ethers } from "hardhat";
import { Wallet } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Wallet", function () {
  let wallet: Wallet;
  let addr1: HardhatEthersSigner, addr2: HardhatEthersSigner;

  beforeEach(async function () {
    const factory = await ethers.getContractFactory("Wallet");
    const deploy = await factory.deploy();
    wallet = await deploy.waitForDeployment();
    [addr1, addr2] = [
      await ethers.getSigner("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
      await ethers.getSigner("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
    ];
  });

  describe("createWallet", function () {
    it("Should create a new wallet", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      expect(wallets.length).to.equal(1);
      expect(wallets[0].owners).to.deep.equal([addr1.address]);
    });

    it("Should revert if no owners are provided", async function () {
      await expect(
        wallet.createWallet([], "My Wallet", 1)
      ).to.be.revertedWithCustomError(wallet, "Wallet__OwnersIsRequired()");
    });

    it("Should revert if needComfirmCount is zero", async function () {
      await expect(
        wallet.createWallet([addr1.address], "My Wallet", 0)
      ).to.be.revertedWithCustomError(wallet, "Wallet__ConfirmNumIsRequired()");
    });

    it("Should revert if needComfirmCount is more than owners", async function () {
      await expect(
        wallet.createWallet([addr1.address], "My Wallet", 2)
      ).to.be.revertedWithCustomError(
        wallet,
        "Wallet__ConfirmNumCannotMoreThanOwners()"
      );
    });
  });

  describe("deposit", function () {
    it("Should deposit to the wallet", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.deposit(walletId, {
        value: ethers.parseEther("1"),
      });
      expect((await wallet.getUserWallets())[0].balance).to.equal(
        ethers.parseEther("2")
      );
    });

    it("Should revert if amount is zero", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await expect(wallet.deposit(walletId)).to.be.revertedWithCustomError(
        wallet,
        "Wallet__AmountCannotBeZero()"
      );
    });
  });

  describe("requestTransaction", function () {
    it("Should create a new transaction", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.requestTransaction(
        walletId,
        addr2.address,
        ethers.parseEther("1"),
        "Test Transaction"
      );
      const [transactions] = await wallet.getWalletTransactions(walletId);
      expect(transactions.length).to.equal(1);
    });

    it("Should revert if amount is zero", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await expect(
        wallet.requestTransaction(
          walletId,
          addr2.address,
          0,
          "Test Transaction"
        )
      ).to.be.revertedWithCustomError(wallet, "Wallet__AmountCannotBeZero()");
    });

    it("Should revert if balance is not enough", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await expect(
        wallet.requestTransaction(
          walletId,
          addr2.address,
          ethers.parseEther("2"),
          "Test Transaction"
        )
      ).to.be.revertedWithCustomError(wallet, "Wallet__NotEnoughBalance()");
    });
  });

  describe("confirmTransaction", function () {
    it("Should confirm a transaction", async function () {
      await wallet.createWallet(
        [addr1.address, addr2.address],
        "My Wallet",
        2,
        {
          value: ethers.parseEther("1"),
        }
      );
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.requestTransaction(
        walletId,
        addr1.address,
        ethers.parseEther("1"),
        "Test Transaction"
      );
      const [transactions] = await wallet.getWalletTransactions(walletId);
      const transactionId = transactions[0].id;
      const tx = await wallet
        .connect(addr2)
        .confirmTransaction(walletId, transactionId, true);
      expect(tx).to.emit(wallet, "TransactionConfirmed");
    });

    it("Should revert if is requestor confirm", async function () {
      await wallet.createWallet(
        [addr1.address, addr2.address],
        "My Wallet",
        2,
        {
          value: ethers.parseEther("1"),
        }
      );
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.requestTransaction(
        walletId,
        addr1.address,
        ethers.parseEther("1"),
        "Test Transaction"
      );
      const [transactions] = await wallet.getWalletTransactions(walletId);
      const transactionId = transactions[0].id;
      await expect(
        wallet.connect(addr1).confirmTransaction(walletId, transactionId, true)
      ).to.be.revertedWithCustomError(
        wallet,
        "Wallet__RequestorCannotConfirm()"
      );
    });

    it("Should revert if sender is not the owner", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.requestTransaction(
        walletId,
        addr2.address,
        ethers.parseEther("1"),
        "Test Transaction"
      );
      const [transactions] = await wallet.getWalletTransactions(walletId);
      const transactionId = transactions[0].id;
      await wallet.createWallet([addr2.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      await expect(
        wallet.connect(addr2).confirmTransaction(walletId, transactionId, true)
      ).to.be.revertedWithCustomError(wallet, "Wallet__OnlyOwnner()");
    });
  });

  describe("cancelTransaction", function () {
    it("Should cancel a transaction", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.requestTransaction(
        walletId,
        addr2.address,
        ethers.parseEther("1"),
        "Test Transaction"
      );
      const [transactions] = await wallet.getWalletTransactions(walletId);
      const transactionId = transactions[0].id;
      const tx = await wallet
        .connect(addr1)
        .cancelTransaction(walletId, transactionId);
      expect(tx).to.emit(wallet, "TransactionCanceled");
    });

    it("Should revert if transaction is not exists", async function () {
      await wallet.createWallet(
        [addr1.address, addr2.address],
        "My Wallet",
        1,
        {
          value: ethers.parseEther("1"),
        }
      );
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.requestTransaction(
        walletId,
        addr2.address,
        ethers.parseEther("1"),
        "Test Transaction"
      );
      await expect(
        wallet
          .connect(addr2)
          .cancelTransaction(walletId, ethers.keccak256("0x00"))
      ).to.be.revertedWithCustomError(wallet, "Wallet__TransactionNotExists()");
    });
  });

  describe("sendTransaction", function () {
    it("Should send a transaction", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.requestTransaction(
        walletId,
        addr2.address,
        ethers.parseEther("1"),
        "Test Transaction"
      );
      const [transactions] = await wallet.getWalletTransactions(walletId);
      const transactionId = transactions[0].id;
      const tx = await wallet
        .connect(addr1)
        .sendTransaction(walletId, transactionId);
      expect(tx).to.emit(wallet, "TransactionSend");
    });

    it("Should revert if transaction is not exists", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.requestTransaction(
        walletId,
        addr2.address,
        ethers.parseEther("1"),
        "Test Transaction"
      );
      await expect(
        wallet
          .connect(addr1)
          .sendTransaction(walletId, ethers.keccak256("0x00"))
      ).to.be.revertedWithCustomError(wallet, "Wallet__TransactionNotExists()");
    });

    it("Should revert if transaction is not confirmed", async function () {
      await wallet.createWallet(
        [addr1.address, addr2.address],
        "My Wallet",
        2,
        {
          value: ethers.parseEther("1"),
        }
      );
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.requestTransaction(
        walletId,
        addr2.address,
        ethers.parseEther("1"),
        "Test Transaction"
      );
      const [transactions] = await wallet.getWalletTransactions(walletId);
      const transactionId = transactions[0].id;
      await expect(
        wallet.connect(addr1).sendTransaction(walletId, transactionId)
      ).to.be.revertedWithCustomError(
        wallet,
        "Wallet__TransactionNotConfirmed()"
      );
    });

    it("Should revert if sender is not the requestor", async function () {
      await wallet.createWallet(
        [addr1.address, addr2.address],
        "My Wallet",
        1,
        {
          value: ethers.parseEther("1"),
        }
      );
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.requestTransaction(
        walletId,
        addr2.address,
        ethers.parseEther("1"),
        "Test Transaction"
      );
      const [transactions] = await wallet.getWalletTransactions(walletId);
      const transactionId = transactions[0].id;
      await expect(
        wallet.connect(addr2).sendTransaction(walletId, transactionId)
      ).to.be.revertedWithCustomError(wallet, "Wallet__OnlyRequestorCanSend()");
    });
  });

  describe("getWalletTransactions", function () {
    it("Should get wallet transactions", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.requestTransaction(
        walletId,
        addr2.address,
        ethers.parseEther("1"),
        "Test Transaction"
      );
      const [transactions, confirmStatus] = await wallet.getWalletTransactions(
        walletId
      );
      expect(transactions.length).to.equal(1);
      expect(confirmStatus.length).to.equal(1);
    });
  });

  describe("getWalletDeposits", function () {
    it("Should get wallet deposits", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      const walletId = wallets[0].id;
      await wallet.deposit(walletId, {
        value: ethers.parseEther("1"),
      });
      const deposits = await wallet.getWalletDeposits(walletId);
      expect(deposits.length).to.equal(1);
      expect(deposits[0].amount).to.equal(ethers.parseEther("1"));
    });
  });

  describe("getUserWallets", function () {
    it("Should get user wallets", async function () {
      await wallet.createWallet([addr1.address], "My Wallet", 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await wallet.getUserWallets();
      expect(wallets.length).to.equal(1);
      expect(wallets[0].owners).to.deep.equal([addr1.address]);
    });
  });
});
