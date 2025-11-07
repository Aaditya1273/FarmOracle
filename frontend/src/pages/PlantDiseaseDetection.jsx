import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../config/api";
import { analyzePlantDisease } from "../services/geminiService";

const PlantDiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detectionResult, setDetectionResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidPlantImage, setIsValidPlantImage] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [diseases, setDiseases] = useState([
    { name: "Late Blight", count: 12 },
    { name: "Early Blight", count: 8 },
    { name: "Bacterial Spot", count: 5 },
    { name: "Healthy", count: 42 }
  ]);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const validatePlantImage = async (file) => {
    setIsValidating(true);
    setValidationMessage("");
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await axios.post(
        ENDPOINTS.VALIDATE_PLANT_IMAGE,
        formData,
        { 
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 5000 // 5 second timeout
        }
      );
      
      // Check if validation service returned an error
      if (response.data.status === "error") {
        console.warn("Validation service error, allowing analysis anyway");
        setIsValidPlantImage(true); // Allow analysis
        setValidationMessage("");
        return true;
      }
      
      const isPlant = response.data.is_plant;
      setIsValidPlantImage(isPlant);
      
      if (!isPlant) {
        setValidationMessage("⚠️ Please upload only plant, crop, vegetable, or fruit images");
      } else {
        setValidationMessage("");
      }
      
      return isPlant;
    } catch (error) {
      console.error("Validation request failed, allowing analysis anyway");
      // If backend is down, allow analysis (Gemini will handle it)
      setIsValidPlantImage(true);
      setValidationMessage("");
      return true;
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult("");
      
      // Validate if it's a plant image
      await validatePlantImage(file);
    }
  };

  const openCamera = async () => {
    try {
      const ipAddress = "10.9.143.196";
      const port = "4747";
      
      const droidcamUrl = `http://${ipAddress}:${port}/video`;
      
      if (!videoRef.current) {
        console.error("Video element is not available");
        alert("Camera initialization failed. Please try again.");
        return;
      }
      
      const testConnection = new Image();
      testConnection.onload = () => {
        console.log("DroidCam connection successful");

        if (videoRef.current) {
          videoRef.current.src = droidcamUrl;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => {
                setIsCameraOpen(true);
              })
              .catch(error => {
                console.error("Error playing DroidCam feed:", error);
                tryAlternativeUrl();
              });
          };
          
          videoRef.current.onerror = () => {
            console.error("Error loading DroidCam video feed");
            tryAlternativeUrl();
          };
        }
      };
      
      testConnection.onerror = () => {
        console.error("Could not connect to primary DroidCam URL");
        tryAlternativeUrl();
      };
      
      testConnection.src = `http://${ipAddress}:${port}/mjpegfeed?640x480`;
      
      const tryAlternativeUrl = () => {
        console.log("Trying alternative DroidCam URL format...");
        
        if (!videoRef.current) {
          console.error("Video element is not available during fallback");
          alert("Camera initialization failed. Please try again.");
          setIsCameraOpen(false);
          return;
        }
        
        const mjpegUrl = `http://${ipAddress}:${port}/mjpegfeed`;
        videoRef.current.src = mjpegUrl;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setIsCameraOpen(true);
            })
            .catch(error => {
              console.error("Error playing alternative DroidCam feed:", error);
              tryThirdOption();
            });
        };
        
        videoRef.current.onerror = () => {
          console.error("Error loading alternative DroidCam feed");
          tryThirdOption();
        };
      };
      
      const tryThirdOption = () => {
        console.log("Trying third DroidCam URL format...");
        
        if (!videoRef.current) {
          console.error("Video element is not available during second fallback");
          alert("Camera initialization failed. Please try again.");
          setIsCameraOpen(false);
          return;
        }
        
        const webrtcUrl = `http://${ipAddress}:${port}/videofeed`;
        videoRef.current.src = webrtcUrl;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setIsCameraOpen(true);
            })
            .catch(finalError => {
              console.error("All DroidCam connection attempts failed:", finalError);
              alert("Could not connect to DroidCam after multiple attempts. Please verify:\n1. DroidCam is running on your phone\n2. Your phone and computer are on the same network\n3. The IP address and port are correct (10.9.143.196:4747)\n4. No firewall is blocking the connection");
              closeCamera();
            });
        };
        
        videoRef.current.onerror = () => {
          console.error("All DroidCam connection attempts failed");
          alert("Could not connect to DroidCam after multiple attempts. Please verify your DroidCam settings and network connection.");
          closeCamera();
        };
      };
      
    } catch (error) {
      console.error("Error accessing DroidCam:", error);
      alert("Could not access DroidCam. Please check your connection and DroidCam settings.");
      closeCamera();
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      console.error("Video or canvas element is not available");
      return;
    }
    
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(blob));
      
      // Validate captured image
      await validatePlantImage(file);
      
      closeCamera();
    }, 'image/jpeg', 0.95);
  };

  const closeCamera = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.load();
    }
    setIsCameraOpen(false);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setDetectionResult("");

    try {
      // Try backend first
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await axios.post(ENDPOINTS.PREDICT_DISEASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 10000 // 10 second timeout
      });

      console.log("Detection result:", response.data);
      setDetectionResult(response.data);
      
      // Show modal if analysis was successful
      if (response.data?.status === "success" || response.data?.prediction) {
        setShowReportModal(true);
      }
    } catch (backendError) {
      console.log("Backend unavailable, using Gemini AI fallback...");
      
      try {
        // Fallback to Gemini AI
        const geminiResult = await analyzePlantDisease(selectedImage);
        
        // Format result to match backend response
        const formattedResult = {
          status: "success",
          prediction: geminiResult.disease_name,
          confidence: geminiResult.confidence,
          description: geminiResult.description,
          treatment: geminiResult.treatment,
          prevention: geminiResult.prevention,
          source: "Gemini AI (Fallback)"
        };
        
        setDetectionResult(formattedResult);
        setShowReportModal(true);
      } catch (geminiError) {
        console.error("Gemini fallback failed:", geminiError);
        
        // Show the actual error message to help debug
        let errorMessage = "Analysis failed. ";
        if (geminiError.message.includes('API key not configured')) {
          errorMessage = "Gemini API key is not configured. Please contact the administrator.";
        } else if (geminiError.message.includes('invalid')) {
          errorMessage = "Gemini API key is invalid. Please contact the administrator.";
        } else {
          errorMessage = `Analysis failed: ${geminiError.message}`;
        }
        
        setDetectionResult({ 
          error: errorMessage
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 8 + 2}px`,
              height: `${Math.random() * 8 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="text-center mb-8 pt-6">
          <div 
            className={`transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
          >
            <p className="text-gray-600 uppercase tracking-wider text-sm mb-2 relative inline-block">
              SMART AGRICULTURAL TOOLS
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            </p>
            <br></br>
            <h1 className="text-gray-900 text-4xl md:text-5xl font-bold relative inline-block">
              Plant Disease Detection
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-black transform scale-x-0 origin-left transition-transform duration-700" 
                style={{ transform: isLoaded ? 'scaleX(1)' : 'scaleX(0)' }}
              ></div>
            </h1>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left section: Upload and camera controls */}
          <div 
            className={`bg-white rounded-xl p-6 flex flex-col items-center transition-all duration-500 shadow-xl border border-gray-200 transform ${isLoaded ? 'translateY(0) opacity-100' : 'translateY(50px) opacity-0'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="relative w-full aspect-square mb-6 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
              {isCameraOpen ? (
                <>
                  <video 
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              ) : previewUrl ? (
                <img src={previewUrl} alt="Selected plant" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 mb-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-600 font-medium">Upload or capture an image to begin analysis</p>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
                  <p className="absolute text-white mt-24 font-semibold">Analyzing...</p>
                </div>
              )}
            </div>
            
            {/* Validation Message */}
            {validationMessage && (
              <div className="w-full mb-4 bg-red-50 border-2 border-red-400 rounded-lg p-4 animate-fadeIn">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-bold text-red-800 mb-1">Invalid Image</p>
                    <p className="text-red-700 text-sm">{validationMessage}</p>
                    <p className="text-red-600 text-xs mt-2">Please upload a clear photo of plant leaves, stems, or fruits showing any disease symptoms.</p>
                  </div>
                </div>
              </div>
            )}
            
            {isValidating && (
              <div className="w-full mb-4 bg-blue-50 border-2 border-blue-400 rounded-lg p-4 animate-pulse">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <p className="text-blue-800 font-medium">Validating image...</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 w-full">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
              
              <button
                onClick={() => fileInputRef.current.click()}
                className="col-span-1 bg-gray-800 hover:bg-black text-white py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 group font-medium shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Upload
              </button>
              
              {isCameraOpen ? (
                <>
                  <button
                    onClick={captureImage}
                    className="col-span-1 bg-black text-white py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-800 font-medium shadow-md hover:shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Capture
                  </button>
                  
                  <button
                    onClick={closeCamera}
                    className="col-span-1 bg-red-500 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-opacity-90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openCamera}
                    className="col-span-1 bg-gray-800 hover:bg-black text-white py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 group font-medium shadow-md hover:shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-smart-yellow group-hover:scale-110 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Camera
                  </button>
                  
                  <button
                    onClick={analyzeImage}
                    disabled={!selectedImage || isAnalyzing || !isValidPlantImage || isValidating}
                    className={`col-span-1 py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 font-medium shadow-md ${
                      !selectedImage || isAnalyzing || !isValidPlantImage || isValidating
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                        : "bg-black text-white hover:bg-gray-800 hover:shadow-lg"
                    }`}
                    title={!isValidPlantImage ? "Please upload a plant image" : ""}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.625 2.655A9 9 0 0119 11a1 1 0 11-2 0 7 7 0 00-9.625-6.492 1 1 0 11-.75-1.853zM4.662 4.959A1 1 0 014.75 6.37 6.97 6.97 0 003 11a1 1 0 11-2 0 8.97 8.97 0 012.25-5.953 1 1 0 011.412-.088z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M5 11a5 5 0 1110 0 1 1 0 11-2 0 3 3 0 10-6 0c0 1.677-.345 3.276-.968 4.729a1 1 0 11-1.838-.789A9.964 9.964 0 005 11z" clipRule="evenodd" />
                    </svg>
                    {isValidating ? "Validating..." : "Analyze"}
                  </button>
                </>
              )}
            </div>
            
            {detectionResult && !isCameraOpen && (
              <div className="mt-6 w-full bg-white rounded-lg p-4 border-2 border-gray-200 shadow-lg animate-fadeIn">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">Analysis Results</h3>
                
                {detectionResult.error ? (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {detectionResult.error}
                    </p>
                    <p className="text-sm mt-2">Please try again with a clearer image.</p>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-sm">Disease</p>
                        <p className="text-xl font-bold text-gray-900">{detectionResult.class}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-sm">Confidence</p>
                        <p className="text-xl font-bold text-gray-900">{(detectionResult.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="bg-black bg-opacity-30 p-3 rounded-lg flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${detectionResult.status === "HEALTHY" ? "bg-green-500" : "bg-red-500"}`}></div>
                      <p>Status: <span className={detectionResult.status === "HEALTHY" ? "text-green-400" : "text-red-400"}>{detectionResult.status}</span></p>
                    </div>
                    
                    {detectionResult.treatment && (
                      <div className="mt-4 bg-black bg-opacity-30 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Recommended Treatment:</p>
                        <p>{detectionResult.treatment}</p>
                      </div>
                    )}
                    
                    {/* User-Friendly Report from Gemini */}
                    {detectionResult.prediction?.user_friendly_report && (
                      <div className="mt-6 bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200 shadow-lg">
                        <div className="flex items-center mb-4">
                          <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h4 className="text-2xl font-bold text-gray-900">📋 Detailed Analysis Report</h4>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-line leading-relaxed">
                          {detectionResult.prediction.user_friendly_report}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-6">
            <div 
              className={`bg-white rounded-xl p-6 transition-all duration-500 shadow-xl border border-gray-200 transform ${isLoaded ? 'translateY(0) opacity-100' : 'translateY(50px) opacity-0'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                How It Works
              </h3>
              
              <div className="space-y-4 text-gray-700 text-sm">
                <p>Our AI-powered plant disease detection system uses computer vision to identify diseases in crops. The system is trained on thousands of images of healthy and diseased plants.</p>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="font-medium mb-2">Simple 3-step process:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Upload or capture a clear image of the affected plant</li>
                    <li>Our AI analyzes the image for disease patterns</li>
                    <li>Receive instant identification and treatment advice</li>
                  </ol>
                </div>
                
                <p>For best results, take close-up images of affected leaves or stems in good lighting conditions.</p>
              </div>
            </div>
            
            <div 
              className={`bg-white rounded-xl p-6 transition-all duration-500 shadow-xl border border-gray-200 transform ${isLoaded ? 'translateY(0) opacity-100' : 'translateY(50px) opacity-0'}`}
              style={{ transitionDelay: '400ms' }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                Recent Farm Statistics
              </h3>
              
              <div className="space-y-3">
                <p className="text-gray-700 text-sm mb-2">Common diseases detected on your farm:</p>
                
                {diseases.map((disease, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-900 font-medium">{disease.name}</span>
                      <span className="text-sm text-gray-600">{disease.count} cases</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${disease.name === "Healthy" ? "bg-green-500" : "bg-red-500"}`} 
                        style={{ width: `${(disease.count / Math.max(...diseases.map(d => d.count))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Modal Popup */}
      {showReportModal && detectionResult && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-10 h-10 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <h2 className="text-2xl font-bold">Analysis Report</h2>
                    <p className="text-green-100 text-sm">AI-Powered Diagnosis & Treatment Plan</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                  <p className="text-gray-600 text-sm font-semibold mb-1">Disease Detected</p>
                  <p className="text-xl font-bold text-gray-900">
                    {detectionResult.prediction?.disease || detectionResult.class || "Unknown"}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                  <p className="text-gray-600 text-sm font-semibold mb-1">Confidence Level</p>
                  <p className="text-xl font-bold text-gray-900">{(detectionResult.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              {/* Detailed Report */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200 shadow-inner">
                {detectionResult.prediction?.user_friendly_report ? (
                  <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-line leading-relaxed">
                    {detectionResult.prediction.user_friendly_report}
                  </div>
                ) : (
                  <div className="text-gray-900">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-3 border-b-2 border-gray-300 pb-2">
                        What We Found
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Our AI has identified <strong className="text-black">{detectionResult.prediction?.disease || detectionResult.class || "a disease"}</strong> affecting your plant with <strong className="text-black">{(detectionResult.confidence * 100).toFixed(1)}%</strong> confidence.
                      </p>
                    </div>
                    
                    <div className="bg-gray-100 border-l-4 border-gray-600 p-4 mb-6">
                      <p className="text-sm text-gray-800">
                        <strong>Important:</strong> Detailed treatment recommendations are being generated by our AI. For immediate action, please consult with a local agricultural expert or extension service.
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-3 border-b-2 border-gray-300 pb-2">
                        Immediate Actions
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="text-black font-bold mr-3 min-w-[24px]">1.</span>
                          <span className="text-gray-700">Remove and destroy affected plant parts immediately to prevent spread</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-black font-bold mr-3 min-w-[24px]">2.</span>
                          <span className="text-gray-700">Isolate infected plants from healthy ones</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-black font-bold mr-3 min-w-[24px]">3.</span>
                          <span className="text-gray-700">Improve air circulation around plants</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-black font-bold mr-3 min-w-[24px]">4.</span>
                          <span className="text-gray-700">Avoid overhead watering - water at soil level</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-black font-bold mr-3 min-w-[24px]">5.</span>
                          <span className="text-gray-700">Contact local agricultural extension services for specific treatment</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                      <p className="text-sm text-gray-800">
                        <strong>Need Help?</strong> Visit your local agricultural office or contact farming experts in your area for personalized treatment plans.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(detectionResult.prediction.user_friendly_report);
                    alert('Report copied to clipboard!');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Report
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Got It!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PlantDiseaseDetection;