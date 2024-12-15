import { expect } from "chai";
import { ethers, config } from "hardhat";
import { UserWalletStorage } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("UserWalletStorage", function () {
  let userWalletStorage: UserWalletStorage;
  let addr1: HardhatEthersSigner, addr2: HardhatEthersSigner;

  beforeEach(async function () {
    const factory = await ethers.getContractFactory("UserWalletStorage");
    const deploy = await factory.deploy();
    userWalletStorage = await deploy.waitForDeployment();
    [addr1, addr2] = [
      await ethers.getSigner("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
      await ethers.getSigner("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
    ];
  });

  describe("createWallet", function () {
    it("Should create a new wallet", async function () {
      await userWalletStorage.createWallet("My Wallet", [addr1.address], 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await userWalletStorage.getWallets(addr1.address);
      const id = wallets[0].id;
      const wallet = await userWalletStorage.getWalletById(addr2.address, id);
      expect(wallet.name).to.equal("My Wallet");
      expect(wallet.owners).to.deep.equal([addr1.address]);
      expect(wallet.needComfirmCount).to.equal(1);
      expect(wallet.balance).to.equal(ethers.parseEther("1"));
    });
  });

  describe("setWalletBalance", function () {
    it("Should set wallet balance", async function () {
      await userWalletStorage.createWallet("My Wallet", [addr1.address], 1, {
        value: ethers.parseEther("1"),
      });
      const wallets = await userWalletStorage.getWallets(addr1.address);
      const id = wallets[0].id;
      await userWalletStorage.setWalletBalance(
        addr1.address,
        id,
        ethers.parseEther("2")
      );
      const wallet = await userWalletStorage.getWalletById(addr1.address, id);
      expect(wallet.balance).to.equal(ethers.parseEther("2"));
    });
  });

  describe("getWalletById", function () {
    it("Should get wallet by id", async function () {
      const tx = await userWalletStorage.createWallet(
        "My Wallet",
        [addr1.address],
        1
      );
      const wallets = await userWalletStorage.getWallets(addr1.address);
      const id = wallets[0].id;
      const wallet = await userWalletStorage.getWalletById(addr1.address, id);

      expect(wallet.name).to.equal("My Wallet");
      expect(wallet.walletType).to.equal(0);
      expect(wallet.balance).to.equal(0);
      expect(wallet.owners).to.deep.equal([addr1.address]);
      expect(wallet.needComfirmCount).to.equal(1);
      expect(wallet.timestamp).to.equal((await tx.getBlock())?.timestamp);
    });
  });

  describe("getWallets", function () {
    it("Should get wallets for an owner", async function () {
      const tx1 = await userWalletStorage.createWallet(
        "Wallet 1",
        [addr1.address],
        1
      );
      const tx2 = await userWalletStorage.createWallet(
        "Wallet 2",
        [addr1.address, addr2.address],
        2
      );
      expect(
        (await userWalletStorage.getWallets(addr2.address)).length
      ).to.equal(1);
      const wallets = await userWalletStorage.getWallets(addr1.address);
      expect(wallets.length).to.equal(2);
      expect(wallets[0].name).to.equal("Wallet 1");
      expect(wallets[0].walletType).to.equal(0);
      expect(wallets[0].balance).to.equal(0);
      expect(wallets[0].owners).to.deep.equal([addr1.address]);
      expect(wallets[0].needComfirmCount).to.equal(1);
      expect(wallets[0].timestamp).to.equal(
        (await tx1.getBlock())?.timestamp
      );
      expect(wallets[1].name).to.equal("Wallet 2");
      expect(wallets[1].walletType).to.equal(1);
      expect(wallets[1].balance).to.equal(0);
      expect(wallets[1].owners).to.deep.equal([addr1.address, addr2.address]);
      expect(wallets[1].needComfirmCount).to.equal(2);
      expect(wallets[1].timestamp).to.equal(
        (await tx2.getBlock())?.timestamp
      );
    });
  });

  describe("isExists", function () {
    it("Should return true if wallet exists", async function () {
      await userWalletStorage.createWallet("My Wallet", [addr1.address], 1);
      const wallets = await userWalletStorage.getWallets(addr1.address);
      const id = wallets[0].id;
      const exists = await userWalletStorage.isExists(addr1.address, id);
      expect(exists).to.equal(true);
    });
  });

  it("Should return false if wallet does not exist", async function () {
    await userWalletStorage.createWallet("My Wallet", [addr1.address], 1);
    const exists = await userWalletStorage.isExists(
      addr1.address,
      ethers.keccak256("0x00")
    );
    expect(exists).to.equal(false);
  });
});
