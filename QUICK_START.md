# 🚀 Quick Start Guide - FarmOracle

## ⚠️ Important: Backend Must Be Running!

The image validation and disease detection features require the **backend API** to be running.

---

## 🔧 Start Backend

### Option 1: Quick Start
```powershell
# Navigate to backend folder
cd backend

# Run the backend
python main.py
```

Backend will start on: **http://localhost:8000**

### Option 2: With Uvicorn
```powershell
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🌐 Start Frontend

```powershell
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Run development server
npm run dev
```

Frontend will start on: **http://localhost:3000**

---

## ✅ Verify Everything is Working

### 1. Check Backend
Open browser: http://localhost:8000/docs
- You should see FastAPI Swagger documentation

### 2. Check Frontend
Open browser: http://localhost:3000
- You should see FarmOracle homepage

### 3. Test Disease Detection
1. Go to Disease Detection page
2. Upload a plant image
3. Should see "Validating image..." (if Gemini configured)
4. Analyze button should work

---

## 🔑 Enable Gemini AI Features

### 1. Get API Key
Visit: https://makersuite.google.com/app/apikey

### 2. Create `.env` file
```bash
# In root directory
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Restart Backend
```powershell
cd backend
python main.py
```

---

## 🐛 Troubleshooting

### Error: "Network Error"
**Problem**: Backend not running
**Solution**: Start backend with `python main.py`

### Error: "Validation unavailable"
**Problem**: Gemini API key not configured
**Solution**: Add `GEMINI_API_KEY` to `.env` file

### Error: "Port already in use"
**Problem**: Another process using port 8000
**Solution**: 
```powershell
# Find process
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

---

## 📊 What Each Service Does

### Backend (Port 8000)
- Disease detection AI
- Image validation
- Market predictions
- Soil analysis
- NFT operations
- Blockchain interactions

### Frontend (Port 3000)
- User interface
- Wallet connection
- Image upload
- Results display

---

## 🎯 Quick Test Commands

### Test Backend Health
```powershell
curl http://localhost:8000/api/health
```

### Test Image Validation
```powershell
curl -X POST http://localhost:8000/api/ai/validate/plant-image \
  -F "file=@plant_image.jpg"
```

---

## 💡 Pro Tips

1. **Always start backend first**, then frontend
2. **Keep both terminals open** while developing
3. **Check backend logs** if frontend shows errors
4. **Restart backend** after changing `.env` file
5. **Use `Ctrl+C`** to stop servers gracefully

---

## 🔄 Typical Workflow

```
1. Open Terminal 1
   cd backend
   python main.py
   ✅ Backend running on http://localhost:8000

2. Open Terminal 2
   cd frontend
   npm run dev
   ✅ Frontend running on http://localhost:3000

3. Open Browser
   http://localhost:3000
   ✅ Start using FarmOracle!
```

---

**Now you're ready to use FarmOracle!** 🌾✨
