import type {
  AddOwnerTxParams,
  SafeAccountConfig} from "@safe-global/protocol-kit";
import {
  EthersAdapter,
  SafeFactory,
} from "@safe-global/protocol-kit";
import { ethers } from "ethers";

const safeTransaction = async () => {
  const sourceWalletAddress = process.env.SOURCE_WALLET_ARRDRESS ?? "";

  const transferToAddress = process.env.TRANSFER_TO_ADDRESS ?? "";

  // setUp third party
  const alchemyUrl = process.env.ALCHMEY_URL ?? "";

  const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);

  const third = new ethers.Wallet(sourceWalletAddress, provider);

  const ethAdapterOwner1 = new EthersAdapter({
    ethers,
    signerOrProvider: third,
  });

  const safeFactory = await SafeFactory.create({
    ethAdapter: ethAdapterOwner1,
  });
  const safeAccountConfig: SafeAccountConfig = {
    owners: [
      await third.getAddress(), // set original owner to be server
    ],
    threshold: 1,
  };

  // create safe for user
  const safeInstance = await safeFactory.deploySafe({ safeAccountConfig });
  const safeAddress = safeInstance.getAddress();
  console.log(safeAddress);

  let safeTX = await safeInstance.createEnableModuleTx(
    process.env.CONTRACT_ADDRESS ?? ""
  );
  let txResponse = await safeInstance.executeTransaction(safeTX);
  await txResponse.transactionResponse?.wait();

  // new owner setting
  let params: AddOwnerTxParams = {
    ownerAddress: transferToAddress,
    threshold: 1,
  };

  safeTX = await safeInstance.createAddOwnerTx(params);
  txResponse = await safeInstance.executeTransaction(safeTX);
  await txResponse.transactionResponse?.wait();

  console.log("Adding new owner: ", txResponse);

  params = {
    ownerAddress: await third.getAddress(),
    threshold: 1,
  };
  safeTX = await safeInstance.createRemoveOwnerTx(params);
  txResponse = await safeInstance.executeTransaction(safeTX);
  await txResponse.transactionResponse?.wait();

  console.log("Removing dev: ", txResponse);
};

export default safeTransaction;
