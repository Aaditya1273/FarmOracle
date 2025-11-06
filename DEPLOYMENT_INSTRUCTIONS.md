# 🚀 Deploy Updated Marketplace Contract

## ⚠️ IMPORTANT: You MUST deploy the new contract!

The current contract address `0x2f4C507343fC416eAD53A1223b7d344E1e90eeC4` does NOT have the new profile features.

## 📋 Steps to Deploy:

### **1. Disable Other Wallets**
- Go to `chrome://extensions/`
- Disable: OKX Wallet, Phantom Wallet
- Keep ONLY MetaMask enabled

### **2. Compile Contract**
```bash
cd contracts
solc --abi --bin Marketplace.sol -o build/
```

### **3. Deploy to Sepolia Testnet**

**Option A: Using Remix IDE (Easiest)**
1. Go to https://remix.ethereum.org/
2. Create new file: `Marketplace.sol`
3. Copy contract code from `contracts/Marketplace.sol`
4. Compile (Ctrl+S)
5. Go to "Deploy & Run Transactions"
6. Select "Injected Provider - MetaMask"
7. Make sure you're on Sepolia testnet
8. Click "Deploy"
9. Copy the deployed contract address

**Option B: Using Hardhat**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
# Follow prompts
# Add deployment script
npx hardhat run scripts/deploy.js --network sepolia
```

### **4. Update Contract Address**
In `frontend/src/components/marketplaceWeb3.js`:
```javascript
const contractAddress = "YOUR_NEW_CONTRACT_ADDRESS_HERE";
```

### **5. Get Sepolia ETH**
- Go to https://sepoliafaucet.com/
- Enter your wallet address
- Get free test ETH

### **6. Test**
1. Refresh marketplace page
2. Click "List Crop"
3. MetaMask should open
4. Approve transaction
5. Crop should be listed!

## 🔍 Verify Deployment
Check your contract on Sepolia Etherscan:
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

## ⚡ Quick Deploy with Remix (Recommended)

1. **Open Remix**: https://remix.ethereum.org/
2. **Create file**: `Marketplace.sol`
3. **Paste contract** from `contracts/Marketplace.sol`
4. **Compile**: Click compile button
5. **Connect MetaMask**: 
   - Deploy tab → Environment → "Injected Provider - MetaMask"
   - Switch MetaMask to Sepolia testnet
6. **Deploy**: Click "Deploy" button
7. **Copy address**: From deployed contracts section
8. **Update code**: Paste address in `marketplaceWeb3.js`

## ✅ After Deployment

Your marketplace will:
- ✅ List crops on blockchain
- ✅ Show in Buy Crops section
- ✅ Track in Profile section
- ✅ Record all transactions

## 🚨 Common Issues

**Issue**: Transaction fails
**Fix**: Make sure you have Sepolia ETH

**Issue**: Wrong wallet opens
**Fix**: Disable all wallets except MetaMask

**Issue**: Contract not found
**Fix**: Verify contract address is correct

**Issue**: Can't see listed crops
**Fix**: Make sure you deployed the NEW contract with profile features
