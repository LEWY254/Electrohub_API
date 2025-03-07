import { ethers as ether } from "ethers";
import fs from "fs";

const electroneum_RPC = "https://rpc.electroneum.com";
const ankr_rpc = "https://rpc.ankr.com/electroneum";

const provider = new ether.JsonRpcProvider(electroneum_RPC);

function importWallet(filePath) {
    // Implementation needed
}

function createWallet(keyPhrase = "", providerInstance = provider) {
    if (keyPhrase) {
        const wallet = ether.Wallet.fromPhrase(keyPhrase, providerInstance);
        return wallet;
    }
    const wallet = ether.Wallet.createRandom(providerInstance);
    return wallet;
}

async function sendETN(sender, receiver, transaction_amount) {
    let success = false;
    let error = null;
    if (sender && receiver && transaction_amount) {
        try {
            let gas_fees = await provider.getGasPrice();
            let sender_balance = await sender.getBalance();
            if (sender_balance.gte(ether.utils.parseEther(transaction_amount).add(gas_fees))) {
                const tx = {
                    to: receiver,
                    value: ether.utils.parseEther(transaction_amount)
                };
                const transaction = await sender.sendTransaction(tx);
                const transaction_hash = transaction.hash;
                return {
                    message: "Transaction successful",
                    success: true,
                    hash: transaction_hash,
                    error: error
                };
            } else {
                return {
                    message: "Insufficient balance",
                    success: false,
                    error: "Insufficient balance"
                };
            }
        } catch (e) {
            error = e;
        }
    }
    return {
        message: "Transaction failed",
        success: false,
        error: error
    };
}

async function checkBalance(wallet) {
    try {
        const balance = await provider.getBalance(wallet.address);
        return ether.utils.formatEther(balance);
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

async function getTransactionHistory(wallet) {
    try {
        const history = await provider.getHistory(wallet.address);
        const transactionsWithTimestamps = await Promise.all(history.map(async (tx) => {
            const block = await provider.getBlock(tx.blockNumber);
            return {
                ...tx,
                timestamp: new Date(block.timestamp * 1000).toISOString()
            };
        }));
        return transactionsWithTimestamps;
    } catch (error) {
        console.error('Error getting transaction history:', error);
        return `Error: ${error.message}`;
    }
}

export{ checkBalance, ether, electroneum_RPC, ankr_rpc, importWallet, createWallet, sendETN,getTransactionHistory };