# 🌾 FarmOracle Blockchain Marketplace - Complete Guide

## ✅ **What's Implemented**

### **1. Smart Contract Features** (`contracts/Marketplace.sol`)
- ✅ **List Crops** - Farmers can list crops with name, quantity, and price
- ✅ **Buy Crops** - Buyers can purchase listed crops with wallet approval
- ✅ **Profile Tracking** - Tracks all listings and purchases per wallet
- ✅ **Blockchain Events** - Emits events for all transactions
- ✅ **Seller Protection** - Cannot buy your own crops
- ✅ **Timestamps** - Records when crops were listed

### **2. Frontend Features** (`frontend/src/components/Marketplace.js`)
- ✅ **3 Tabs**: List Crops | Buy Crops | Profile
- ✅ **Wallet Integration** - Auto-connects MetaMask on load
- ✅ **List Crops** - Form to list crops on blockchain
- ✅ **Buy Crops** - Search by ID and purchase
- ✅ **Profile Section**:
  - My Listed Crops (with sold/available status)
  - My Purchases (all bought crops)
  - Wallet address display

### **3. Web3 Integration** (`frontend/src/components/marketplaceWeb3.js`)
- ✅ `listCrop()` - List crop with wallet approval
- ✅ `buyCrop()` - Buy crop with payment transaction
- ✅ `getCrop()` - Fetch crop details
- ✅ `getMyListings()` - Get user's listed crops
- ✅ `getMyPurchases()` - Get user's purchases
- ✅ `getAllAvailableCrops()` - Get all unsold crops
- ✅ `connectWallet()` - Connect MetaMask

## 🔧 **How It Works**

### **Listing a Crop**
1. User fills form: Crop Name, Quantity, Price (wei)
2. Clicks "List Crop" button
3. MetaMask popup asks for transaction approval
4. After approval, crop is recorded on blockchain
5. Crop appears in "My Listed Crops" in Profile
6. Success message shows

### **Buying a Crop**
1. User enters Crop ID in Buy section
2. Clicks "Find" to fetch crop details
3. Reviews crop info (name, quantity, price, seller)
4. Clicks "Buy This Crop"
5. MetaMask popup asks for payment approval
6. After approval, payment sent to seller
7. Crop marked as sold on blockchain
8. Crop appears in "My Purchases" in Profile

### **Profile View**
- **My Listed Crops**: Shows all crops you've listed (sold/available status)
- **My Purchases**: Shows all crops you've bought
- **Wallet Address**: Displays connected wallet

## 📋 **Smart Contract Functions**

```solidity
// List a crop
function listCrop(string memory name, uint quantity, uint price) public

// Buy a crop
function buyCrop(uint cropId) public payable

// Get crop details
function getCrop(uint cropId) public view returns (...)

// Get my listings
function getMyListings() public view returns (uint[] memory)

// Get my purchases
function getMyPurchases() public view returns (uint[] memory)

// Get all available crops
function getAllAvailableCrops() public view returns (uint[] memory)
```

## 🚀 **Deployment Steps**

### **1. Deploy Smart Contract**
```bash
cd contracts
# Compile contract
solc --abi --bin Marketplace.sol -o build/

# Deploy to Sepolia testnet (or your preferred network)
# Update contract address in marketplaceWeb3.js
```

### **2. Update Contract Address**
In `frontend/src/components/marketplaceWeb3.js`:
```javascript
const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### **3. Run Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 🔐 **Wallet Requirements**

- **MetaMask** installed in browser
- Connected to correct network (Sepolia testnet or mainnet)
- Sufficient ETH for gas fees
- Wallet must approve each transaction

## 📊 **Data Structure**

### **Crop Object**
```javascript
{
  id: uint,           // Unique crop ID
  farmer: address,    // Seller's wallet address
  name: string,       // Crop name
  quantity: uint,     // Quantity available
  price: uint,        // Price in wei
  sold: bool,         // Sale status
  buyer: address,     // Buyer's address (if sold)
  timestamp: uint     // When listed
}
```

## 🎯 **Key Features**

1. ✅ **Blockchain Verified** - All transactions on-chain
2. ✅ **Wallet Approval Required** - User must approve each action
3. ✅ **Profile Tracking** - Complete history of listings and purchases
4. ✅ **Real-time Updates** - Profile refreshes after each transaction
5. ✅ **Secure** - Cannot buy own crops, payment goes directly to seller
6. ✅ **Transparent** - All events logged on blockchain

## 🌟 **User Flow**

```
1. Connect Wallet (MetaMask)
   ↓
2. Choose Action:
   - List Crop → Fill form → Approve transaction → Listed on blockchain
   - Buy Crop → Search ID → Review → Approve payment → Purchased
   - View Profile → See all listings and purchases
   ↓
3. Profile Auto-Updates after each transaction
```

## 🔍 **Testing**

1. **List a Crop**:
   - Name: "Tomatoes"
   - Quantity: 100
   - Price: 1000000000000000 (0.001 ETH in wei)

2. **Buy the Crop**:
   - Get Crop ID from listing
   - Search in Buy section
   - Purchase with different wallet

3. **Check Profile**:
   - Seller sees crop in "My Listed Crops" (marked as Sold)
   - Buyer sees crop in "My Purchases"

## 🎉 **Success!**

Your FarmOracle Blockchain Marketplace is now fully functional with:
- ✅ Crop listing on blockchain
- ✅ Crop buying with wallet approval
- ✅ Complete profile system
- ✅ Transaction history tracking
- ✅ Real-time updates

**Built for Africa Blockchain Festival 2025** 🌍⚡
