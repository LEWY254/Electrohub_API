
import {ethers as ether} from "ethers"
import fs from "fs"
const electroneum_RPC="https://rpc.electroneum.com"
const ankr_rpc="https://rpc.ankr.com/electroneum"

var provider=ether.provider.JsonRpcProvider(electroneum_RPC)

function importWallet(filePath){
    
}
function createWallet(keyPhrase="",provider=provider){
    if (keyPhrase){
        const wallet=ether.Wallet.createRandom().connect(provider)
        wallet.mnemonic.phrase=keyPhrase
        return wallet
    }
    const wallet=ether.Wallet.createRandom().connect(provider)
    return wallet
}

async function sendETN(sender,receiver,transaction_amount){
    let success=false
    let error=null
if (sender && receiver && amount){
    try{
        let gas_fees=await provider.getGasPrice()
        if(sender.amount>=transaction_amount+gas_fees){
            const tx={
                to:receiver,
                value:ether.utils.parseEther(transaction_amount)
            }
            const transaction=await sender.sendTransaction(tx)
            const transaction_hash=await transaction.transaction_hash
            return {
                message:"Transaction successful",
                success:true,
                hash:transaction_hash,
                error:error
            }
        }
    }catch(e){
        error=e
    }
   
}
}

async function checkBalance(wallet){
const balance=await provider.getBalance(wallet.address)
return ether.utils.formatEther(balance)
}

module.exports={ether,electroneum_RPC,ankr_rpc}