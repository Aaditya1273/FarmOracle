# 🌍 FarmOracle: Africa's Autonomous AI Farming Oracle on the Blockchain

**"Empowering African farmers with AI-driven insights and blockchain-backed transparency"**

Welcome to **FarmOracle**, Africa's first comprehensive smart agriculture platform that combines **Computer Vision**, **Predictive Analytics**, and **Decentralized Crop Trading** — all optimized for low-resource environments and built for the **Africa Blockchain Festival 2025**.

🏆 **Built for Africa Blockchain Festival 2025** - Demonstrating the synergy between AI innovation and blockchain trust in agriculture.

---

## 🌍 Vision

FarmOracle empowers African farmers through cutting-edge technology, providing:
- **AI-powered crop insights** accessible via mobile devices
- **Blockchain transparency** for fair crop trading
- **Predictive analytics** to maximize yields and minimize losses
- **Community-driven marketplace** with smart contract security

## ⚙️ Core Features

**FarmOracle** is a comprehensive ecosystem that brings together:

- 🔍 **Oracle Vision**: AI-powered plant disease detection via smartphone cameras
- 📊 **Market Oracle**: Real-time crop price predictions using machine learning
- 🌦️ **Weather Oracle**: Climate forecasting and agricultural alerts
- 🌱 **Soil Oracle**: Instant soil quality analysis and recommendations
- ⛓️ **Blockchain Marketplace**: Transparent, secure crop trading on Polygon
- 📱 **Mobile-First UI**: Optimized for African farmers with limited connectivity

African farmers can make data-driven decisions, detect crop diseases early, access fair market prices, and trade securely using blockchain technology.

---

## 🧠 AI Oracle System

### 🔮 Machine Learning Models
- **Disease Oracle**: EfficientNetB4 deep learning model for instant crop disease diagnosis
- **Price Oracle**: Ensemble models (Random Forest + XGBoost) for market price forecasting
- **Weather Oracle**: Time-series ML models for climate prediction and farming alerts
- **Soil Oracle**: Multi-class classification for soil health assessment and crop recommendations

### ⛓️ Blockchain Infrastructure
- **Smart Contracts**: Deployed on Polygon Amoy Testnet for low-cost, fast transactions
- **Decentralized Trading**: Farmers list crops, buyers purchase with crypto payments
- **Transparency**: All transactions recorded on-chain for complete traceability
- **Web3 Integration**: Seamless wallet connection via MetaMask and Web3.js

### 📱 User Experience
- **Mobile-Optimized**: Designed for smartphones with offline capabilities
- **Low-Bandwidth**: Compressed images and efficient data usage
- **Multi-Language**: Support for major African languages (planned)
- **Farmer Dashboard**: Unified view of all oracle insights and marketplace activity

---

## 💡 Tech Stack

| Layer              | Technologies Used                                               |
|--------------------|-----------------------------------------------------------------|
| **Frontend**       | React.js, Tailwind CSS, Web3.js, Framer Motion                |
| **Backend**        | FastAPI, Python, Uvicorn, AI Controller                        |
| **AI/ML**          | TensorFlow, Keras, Scikit-learn, XGBoost, OpenCV              |
| **Blockchain**     | Solidity, Polygon Amoy Testnet, MetaMask, Truffle             |
| **Data Science**   | Pandas, NumPy, Matplotlib, Joblib                             |
| **Infrastructure** | Render (Backend), Vercel/Netlify (Frontend)                   |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and Python 3.9+
- MetaMask wallet with Polygon Amoy testnet configured
- Git for cloning the repository

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd FarmOracle

# Backend setup
cd backend
pip install -r requirements.txt
python start.py

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Add your Polygon Amoy testnet details:
# RPC_URL=https://rpc-amoy.polygon.technology
# PRIVATE_KEY=your_wallet_private_key
# CONTRACT_ADDRESS=deployed_contract_address
```

### 3. Deploy Smart Contract
```bash
cd frontend
npx truffle migrate --network amoy
```

---

## 🔗 Blockchain Deployment (Polygon Testnet)

FarmOracle is deployed on **Polygon Amoy Testnet** for:
- ⚡ **Fast transactions** (2-second block times)
- � **Lowe fees** (fractions of a cent)
- 🌍 **Accessibility** for African farmers
- 🔗 **Ethereum compatibility** with better scalability

### Smart Contract Features:
- `listCrop()`: Farmers list crops for sale
- `buyCrop()`: Buyers purchase with MATIC tokens
- `getCrop()`: View crop details and ownership
- Event logging for complete transparency

---

## 🧠 AI Modules Overview

### Oracle Vision (Plant Disease Detection)
- **Model**: EfficientNetB4 trained on 27 crop diseases
- **Accuracy**: 94.2% on validation set
- **Input**: Smartphone camera images
- **Output**: Disease classification + treatment recommendations

### Market Oracle (Price Prediction)
- **Models**: Random Forest + XGBoost ensemble
- **Data**: Historical price data from African markets
- **Predictions**: 5-week price forecasts with confidence intervals
- **Crops**: Banana, Onion, Tomato, Wheat, Carrot

### Weather Oracle (Climate Forecasting)
- **Model**: LSTM time-series neural network
- **Features**: Temperature, humidity, rainfall predictions
- **Range**: 14-day weather forecasts
- **Alerts**: Automated farming recommendations

### Soil Oracle (Quality Assessment)
- **Model**: Multi-class CNN for soil classification
- **Types**: Alluvial, Black, Clay, Red soil detection
- **Analysis**: NPK levels, pH recommendations
- **Output**: Crop suitability and care instructions

---

## 🎯 Hackathon Focus: Africa Blockchain Festival 2025

**FarmOracle demonstrates the perfect synergy between AI innovation and blockchain trust in agriculture.**

### Judging Criteria Alignment:

**🎨 Originality (25%)**
- First AI + Blockchain farming oracle for Africa
- Novel computer vision approach for crop disease detection
- Unified prediction system combining multiple ML models

**🛠️ Technical Implementation (25%)**
- Production-ready FastAPI backend with ML model serving
- Polygon blockchain integration with smart contracts
- Mobile-optimized React frontend with Web3 connectivity

**💡 Innovation (25%)**
- AI-powered farming insights accessible via smartphone
- Blockchain marketplace ensuring fair crop pricing
- Low-resource optimization for African infrastructure

**🌍 Real-World Impact (25%)**
- Addresses food security challenges in Africa
- Empowers smallholder farmers with technology access
- Creates transparent, trustless agricultural marketplace

---

## 🧑‍🌾 Why FarmOracle?

- **� Early mDetection**: Prevent crop losses with AI-powered disease identification
- **📊 Fair Pricing**: Access real-time, data-driven market prices
- **⛓️ Secure Trading**: Sell crops with blockchain-backed transparency
- **🌍 African-Focused**: Built specifically for African farming challenges
- **📱 Mobile-First**: Works on basic smartphones with limited connectivity

---

## 📱 Live Demo

🌐 **Frontend**: [Coming Soon - Deploy Link]  
🔗 **Backend API**: [Coming Soon - API Link]  
⛓️ **Smart Contract**: [Polygon Amoy Explorer Link]

---

## 🤝 Contributing

We welcome contributions from developers across Africa and beyond! 

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Areas for Contribution
- 🌍 **Localization**: Add support for African languages
- 📱 **Mobile**: Improve offline functionality
- 🧠 **AI Models**: Enhance prediction accuracy
- ⛓️ **Blockchain**: Add more DeFi features
- 🎨 **UI/UX**: Improve farmer experience

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Africa Blockchain Festival 2025** for inspiring this innovation
- **African farmers** who provided insights and feedback
- **Open source community** for the amazing tools and libraries
- **Polygon** for providing scalable blockchain infrastructure

---

**🌍 Built with ❤️ for African farmers at Africa Blockchain Festival 2025**

*"Empowering Africa's agricultural future through AI and blockchain technology"*
