import { expect } from "chai";
import { ethers } from "hardhat";

describe("Incentives", function () {
  it("Test contract", async function () {
    const ContractFactory = await ethers.getContractFactory("Incentives");

    const instance = await ContractFactory.deploy();
    await instance.deployed();

    expect(await instance.name()).to.equal("Incentives");
  });
});
