import React, { useEffect, useState } from 'react';
import "./App.css";
import Header from './pages/Header';
import HeroSection from './pages/HeroSection';
import FarmInfo from './pages/OrganicFarmUI';
import Dashboard from './pages/AgriDashboard';
import News from './pages/AgriNewsSection';
import PlantDiseaseDetection from './pages/PlantDiseaseDetection';
import MarketPrediction from './pages/MarketPrediction';
import WeatherForecast from './pages/WeatherForecast';
import StorageForm from "./components/StorageForm";  
import Marketplace from "./components/Marketplace"; 
import SoilPredictor from './pages/SoilPredictor';
import ApiTestPage from './pages/ApiTestPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple Web3 Context for wallet connection (no RainbowKit)
import { createContext, useContext } from 'react';

export const Web3Context = createContext(null);

export const useWeb3 = () => useContext(Web3Context);

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    
    const checkVisibility = () => {
      const sections = document.querySelectorAll('.scroll-reveal');
      const windowHeight = window.innerHeight;
      
      sections.forEach(section => {
        const boundingRect = section.getBoundingClientRect();
        if (boundingRect.top < windowHeight * 0.85) {
          section.classList.add('visible');
        }
      });
    };
    
    setTimeout(checkVisibility, 100);
    
    let scrollTimeout;
    const handleScroll = () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          checkVisibility();
          scrollTimeout = null;
        }, 10);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <Web3Context.Provider value={{}}>
      <Router>
        <div className={`App ${loaded ? 'app-loaded' : ''}`}>
          <div className="header-container">
            <Header />
          </div>
          
          <Routes>
            <Route path="/disease-detection" element={<PlantDiseaseDetection />} />
            <Route path="/market-prediction" element={<MarketPrediction />} />
            <Route path="/weather-prediction" element={<WeatherForecast />} />
            <Route path="/storage-form" element={<StorageForm />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/soil-predictor" element={<SoilPredictor />} />
            <Route path="/api-test" element={<ApiTestPage />} />
            <Route path="/" element={
              <div className="content-container">
                <div className="scroll-reveal">
                  <HeroSection />
                </div>
                <div className="scroll-reveal">
                  <FarmInfo />
                </div>
                <div className="scroll-reveal">
                  <Dashboard />
                </div>
                <div className="scroll-reveal">
                  <News />
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </Web3Context.Provider>
  );
}

export default App;