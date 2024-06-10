import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";
import { createSmartAccountClient, PaymasterMode } from "@biconomy/account";

export const sendGasslessTransaction = async (recipientAddress:string, transactioningData:any) => {
    // Your configuration with private key and Biconomy API key
    const config = {
        privateKey: "your-private-key",
        biconomyPaymasterApiKey: "8453/cTtUBj84l.4136a47e-591c-4619-8b5e-3826bebe1721",
        bundlerUrl: "https://bundler.biconomy.io/api/v2/8453/dewj2189.wh1289hU-7E49-45ic-af80-JGejLewcS", // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
    };

    // Generate EOA from private key using ethers.js
    //@ts-ignore
    const account = privateKeyToAccount("0x" + config.privateKey);
    const client = createWalletClient({
        account,
        chain: polygonAmoy,
        transport: http(),
    });

    // Create Biconomy Smart Account instance
    const smartWallet = await createSmartAccountClient({
        signer: client,
        biconomyPaymasterApiKey: config.biconomyPaymasterApiKey,
        bundlerUrl: config.bundlerUrl,
    });

    const saAddress = await smartWallet.getAccountAddress();
    console.log("SA Address", saAddress);

    const toAddress = recipientAddress; // Replace with the recipient's address
    const transactionData = transactioningData; // Replace with the actual transaction data

    // Build the transaction
    const tx = {
        to: toAddress,
        data: transactionData,
    };

    // Send the transaction and get the transaction hash
    const userOpResponse = await smartWallet.sendTransaction(tx, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
    });
    const { transactionHash } = await userOpResponse.waitForTxHash();
    console.log("Transaction Hash", transactionHash);
    const userOpReceipt = await userOpResponse.wait();
    if (userOpReceipt.success == 'true') {
        console.log("UserOp receipt", userOpReceipt)
        console.log("Transaction receipt", userOpReceipt.receipt)
    }

}