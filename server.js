import express from 'express';
import bodyParser from 'body-parser';
import { ether,createWallet, checkBalance, sendETN, getTransactionHistory } from './utility.js';
import AfricasTalking from 'africastalking';


const electroneum_RPC = "https://rpc.electroneum.com";
const ankr_rpc = "https://rpc.ankr.com/electroneum";

const provider = new ether.JsonRpcProvider(electroneum_RPC);
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const africasTalking = AfricasTalking({
    apiKey: 'YOUR_API_KEY',
    username: 'YOUR_USERNAME'
});

const sms = africasTalking.SMS;

const demoWallet = createWallet();

app.post('/ussd', async (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    let response = '';
    const textArray = text.split('*');
    
    if (text === '') {
        response = `CON Welcome to Electroneum USSD Service
1. Create Account
2. Use Demo Account
3. Check Balance
4. Send ETN
5. Transaction History`;
    } else if (textArray[0] === '1') {
        // Create Account
        const wallet = createWallet();
        response = `END Account created successfully
Address: ${wallet.address}
Mnemonic: ${wallet.mnemonic.phrase}`;
    } else if (textArray[0] === '2') {
        // Use Demo Account
        response = `CON Demo Account Selected
1. Check Balance
2. Send ETN
3. Transaction History`;
    } else if (textArray[0] === '2' && textArray[1] === '1') {
        // Check Balance for Demo Account
        const balance = await checkBalance(demoWallet);
        response = `END Demo Account Balance is ${balance} ETN`;
    } else if (textArray[0] === '2' && textArray[1] === '2') {
        // Send ETN from Demo Account
        if (textArray.length === 2) {
            response = `CON Enter Receiver Wallet Address`;
        } else if (textArray.length === 3) {
            response = `CON Enter Amount to Send`;
        } else {
            const receiverAddress = textArray[2];
            const amount = textArray[3];
            const result = await sendETN(demoWallet, receiverAddress, amount);
            await sendConfirmationMessage(phoneNumber, result);
            response = result.success ? `END Transaction successful
Hash: ${result.hash}` : `END Transaction failed
Error: ${result.error}`;
        }
    } else if (textArray[0] === '2' && textArray[1] === '3') {
        // Transaction History for Demo Account
        const history = await getTransactionHistory(demoWallet);
        response = `END Transaction History:
${history.map(tx => `Tx: ${tx.hash}, Date: ${tx.timestamp}, Amount: ${tx.value}`).join('\n')}`;
    } else if (textArray[0] === '3') {
        // Check Balance
        if (textArray.length === 1) {
            response = `CON Enter Wallet Address`;
        } else {
            const walletAddress = textArray[1];
            const balance = await checkBalance({ address: walletAddress });
            response = `END Your balance is ${balance} ETN`;
        }
    } else if (textArray[0] === '4') {
        // Send ETN
        if (textArray.length === 1) {
            response = `CON Enter Sender Wallet Address`;
        } else if (textArray.length === 2) {
            response = `CON Enter Receiver Wallet Address`;
        } else if (textArray.length === 3) {
            response = `CON Enter Amount to Send`;
        } else {
            const senderAddress = textArray[1];
            const receiverAddress = textArray[2];
            const amount = textArray[3];
            const result = await sendETN({ address: senderAddress }, receiverAddress, amount);
            await sendConfirmationMessage(phoneNumber, result);
            response = result.success ? `END Transaction successful
Hash: ${result.hash}` : `END Transaction failed
Error: ${result.error}`;
        }
    } else if (textArray[0] === '5') {
        // Transaction History
        if (textArray.length === 1) {
            response = `CON Enter Wallet Address`;
        } else {
            const walletAddress = textArray[1];
            const history = await getTransactionHistory({ address: walletAddress });
            response = `END Transaction History:
${history.map(tx => `Tx: ${tx.hash}, Date: ${tx.timestamp}, Amount: ${tx.value}`).join('\n')}`;
        }
    } else {
        response = `END Invalid option`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

async function sendConfirmationMessage(phoneNumber, result) {
    const message = result.success 
        ? `Transaction successful\nHash: ${result.hash}` 
        : `Transaction failed\nError: ${result.error}`;
    await sms.send({ to: phoneNumber, message });
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});