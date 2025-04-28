// test/MetaTxForwarder.test.ts

import { ethers } from "hardhat";
import { expect } from "chai";

describe("MetaTxForwarder + IDRXPayment Integration", function () {
  let owner: any;
  let user: any;
  let relayer: any;
  let receiver: any;

  let mockIDRX: any;
  let payment: any;
  let forwarder: any;

  beforeEach(async function () {
    [owner, user, relayer, receiver] = await ethers.getSigners();

    const MockIDRX = await ethers.getContractFactory("MockIDRX");
    mockIDRX = await MockIDRX.deploy();
    await mockIDRX.waitForDeployment();

    const MetaTxForwarder = await ethers.getContractFactory("MetaTxForwarder");
    forwarder = await MetaTxForwarder.deploy();
    await forwarder.waitForDeployment();

    const IDRXPayment = await ethers.getContractFactory("IDRXPayment");
    payment = await IDRXPayment.deploy(await mockIDRX.getAddress(), await forwarder.getAddress());
    await payment.waitForDeployment();

    // Give user some tokens and approve only the payment contract
    await mockIDRX.connect(owner).transfer(user.address, ethers.parseEther("100"));
    await mockIDRX.connect(user).approve(await payment.getAddress(), ethers.parseEther("100"));
  });

  it("should execute meta-tx and transfer IDRX with fee", async function () {
    const sender = user.address;
    const receiverAddr = receiver.address;
    const amount = ethers.parseEther("10");
    const nonce = await forwarder.nonces(sender);

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "address", "uint256"],
      [sender, receiverAddr, amount, await payment.getAddress(), nonce]
    );
    const signature = await user.signMessage(ethers.getBytes(messageHash));

    const balanceBefore = await mockIDRX.balanceOf(sender);

    const tx = await forwarder.connect(relayer).executeMetaTransaction(
      sender,
      receiverAddr,
      amount,
      await payment.getAddress(),
      signature
    );
    await tx.wait();

    const fee = amount / BigInt(100); // 1% fee
    const netAmount = amount - fee;

    const balanceAfter = await mockIDRX.balanceOf(sender);
    const expectedSenderBalance = balanceBefore - amount;

    console.log("Sender:", sender);
    console.log("Relayer:", relayer.address);
    console.log("Receiver:", receiverAddr);
    console.log("User balance:", await mockIDRX.balanceOf(sender));
    console.log("Receiver balance:", await mockIDRX.balanceOf(receiverAddr));
    console.log("Relayer balance:", await mockIDRX.balanceOf(relayer.address));

    expect(await mockIDRX.balanceOf(receiverAddr)).to.equal(netAmount);
    expect(await mockIDRX.balanceOf(relayer.address)).to.equal(fee);
    expect(balanceAfter).to.equal(expectedSenderBalance);
  });
});
