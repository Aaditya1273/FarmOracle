# 🚀 FarmOracle - Vercel Deployment Guide

## ✅ Prerequisites
- GitHub account
- Vercel account (free)
- Your project pushed to GitHub

---

## 📋 Step-by-Step Deployment

### **Step 1: Push to GitHub**
```bash
cd "c:/Users/Aditya/OneDrive/Desktop/New folder (2)/FarmOracle"
git init
git add .
git commit -m "FarmOracle - Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/FarmOracle.git
git push -u origin main
```

### **Step 2: Deploy on Vercel**

1. **Go to** [vercel.com](https://vercel.com)
2. **Click** "Add New Project"
3. **Import** your GitHub repository
4. **Configure:**
   - Framework Preset: **Next.js**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Add Environment Variables:**
   - `GEMINI_API_KEY` = your_gemini_api_key
   - `WEATHER_API_KEY` = 3dd41f0b214e431584985419250611
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = 0x2f4C5073431C416eAD53A1223b7d344E1e90eeC4

6. **Click** "Deploy"

### **Step 3: Deploy Backend (Python API)**

Vercel supports Python! Your backend will automatically deploy with the frontend.

---

## 🎯 **What Gets Deployed:**

✅ **Frontend (Next.js)**
- Disease Oracle
- Soil Predictor
- Weather Forecast
- Market Predictions
- Blockchain Marketplace

✅ **Backend (FastAPI)**
- `/api/ai/oracle/disease` - Disease detection
- `/api/ai/oracle/soil` - Soil analysis
- `/api/ai/oracle/weather` - Weather data
- `/api/ai/oracle/market` - Market predictions

✅ **Smart Contract**
- Already deployed on Sepolia: `0x2f4C5073431C416eAD53A1223b7d344E1e90eeC4`

---

## 🔧 **Post-Deployment:**

### **1. Update API URLs in Frontend**
If backend deploys to different URL, update:
```javascript
// frontend/src/config.js or wherever API calls are made
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-vercel-app.vercel.app/api';
```

### **2. Test All Features:**
- ✅ Disease detection working
- ✅ Soil prediction working
- ✅ Weather forecast working
- ✅ Marketplace wallet connection
- ✅ List crop on blockchain
- ✅ Buy crop with wallet

---

## 🌐 **Your Live URLs:**

**Frontend:** `https://farmoracle.vercel.app`
**Backend API:** `https://farmoracle.vercel.app/api`
**Smart Contract:** `https://sepolia.etherscan.io/address/0x2f4C5073431C416eAD53A1223b7d344E1e90eeC4`

---

## 🚨 **Common Issues:**

### **Issue 1: Backend not working**
**Solution:** Vercel has limitations on Python serverless functions. Consider deploying backend separately on:
- **Render.com** (free Python hosting)
- **Railway.app** (free tier)
- **PythonAnywhere** (free tier)

### **Issue 2: Build fails**
**Solution:** Check build logs, ensure all dependencies in package.json

### **Issue 3: Environment variables not working**
**Solution:** Add them in Vercel dashboard → Settings → Environment Variables

---

## 🎉 **You're Live!**

Your FarmOracle is now accessible worldwide! Share your link with judges:
`https://farmoracle.vercel.app`

**Good luck at Africa Blockchain Festival 2025! 🏆🌍⚡**
