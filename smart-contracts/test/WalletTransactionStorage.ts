import { expect } from "chai";
import { ethers } from "hardhat";
import { WalletTransactionStorage } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("WalletTransactionStorage", function () {
  let walletTransactionStorage: WalletTransactionStorage;
  let walletId: string;
  let addr1: HardhatEthersSigner, addr2: HardhatEthersSigner;

  beforeEach(async function () {
    const factory = await ethers.getContractFactory("WalletTransactionStorage");
    const deploy = await factory.deploy();
    walletTransactionStorage = await deploy.waitForDeployment();
    [addr1, addr2] = [
      await ethers.getSigner("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
      await ethers.getSigner("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
    ];
    walletId = ethers.keccak256(
      new ethers.AbiCoder().encode(["string"], ["My Wallet"])
    );
  });

  describe("createTransaction", function () {
    it("Should create a new transaction", async function () {
      const tx = await walletTransactionStorage.createTransaction(
        walletId,
        addr1.address,
        addr2.address,
        ethers.parseEther("1"),
        0,
        "Test Transaction"
      );
      const transactions = await walletTransactionStorage.getTransactions(
        walletId
      );
      const transaction = await transactions[0];
      expect(transaction.from).to.equal(addr1.address);
      expect(transaction.to).to.equal(addr2.address);
      expect(transaction.amount).to.equal(ethers.parseEther("1"));
      expect(transaction.description).to.equal("Test Transaction");
      expect(transaction.timestamp).to.equal((await tx.getBlock())?.timestamp);
    });
  });

  describe("getTransactionById", function () {
    it("Should get transaction by id", async function () {
      await walletTransactionStorage.createTransaction(
        walletId,
        addr1.address,
        addr2.address,
        ethers.parseEther("1"),
        0,
        "Test Transaction"
      );
      const transactions = await walletTransactionStorage.getTransactions(
        walletId
      );
      const id = await transactions[0].id;
      const transaction = await walletTransactionStorage.getTransactionById(
        walletId,
        id
      );
      expect(transaction).to.deep.equal(transactions[0]);
    });
  });

  describe("getTransactions", function () {
    it("Should get transactions for a wallet", async function () {
      await walletTransactionStorage.createTransaction(
        walletId,
        addr1.address,
        addr1.address,
        ethers.parseEther("1"),
        0,
        "Test Transaction 1"
      );
      await walletTransactionStorage.createTransaction(
        walletId,
        addr1.address,
        addr1.address,
        ethers.parseEther("2"),
        0,
        "Test Transaction 2"
      );
      const transactions = await walletTransactionStorage.getTransactions(
        walletId
      );
      expect(transactions.length).to.equal(2);
    });
  });

  describe("setTransactionStatus", function () {
    it("Should set transaction status", async function () {
      await walletTransactionStorage.createTransaction(
        walletId,
        addr1.address,
        addr1.address,
        ethers.parseEther("1"),
        0,
        "Test Transaction"
      );
      const transactions = await walletTransactionStorage.getTransactions(
        walletId
      );
      const id = await transactions[0].id;
      await walletTransactionStorage.setTransactionStatus(walletId, id, 1);
      const transaction = await walletTransactionStorage.getTransactionById(
        walletId,
        id
      );
      expect(transaction.status).to.equal(1);
    });
  });

  describe("setTransactionConfrimedCount", function () {
    it("Should set transaction confirmed count", async function () {
      await walletTransactionStorage.createTransaction(
        walletId,
        addr1.address,
        addr1.address,
        ethers.parseEther("1"),
        0,
        "Test Transaction"
      );
      const transactions = await walletTransactionStorage.getTransactions(
        walletId
      );
      const id = await transactions[0].id;
      await walletTransactionStorage.setTransactionConfrimedCount(
        walletId,
        id,
        2
      );
      const transaction = await walletTransactionStorage.getTransactionById(
        walletId,
        id
      );
      expect(transaction.confirmedCount).to.equal(2);
    });
  });

  describe("isExists", function () {
    it("Should return true if transaction exists", async function () {
      await walletTransactionStorage.createTransaction(
        walletId,
        addr1.address,
        addr1.address,
        ethers.parseEther("1"),
        0,
        "Test Transaction"
      );
      const transactions = await walletTransactionStorage.getTransactions(
        walletId
      );
      const id = await transactions[0].id;
      const exists = await walletTransactionStorage.isExists(walletId, id);
      expect(exists).to.equal(true);
    });

    it("Should return false if transaction does not exist", async function () {
      await walletTransactionStorage.createTransaction(
        walletId,
        addr1.address,
        addr1.address,
        ethers.parseEther("1"),
        0,
        "Test Transaction"
      );
      const exists = await walletTransactionStorage.isExists(
        walletId,
        ethers.keccak256("0x00")
      );
      expect(exists).to.equal(false);
    });
  });
});
