"""
Google Gemini AI Service
Provides AI-powered insights and recommendations for FarmOracle
"""

import os
import logging
from typing import Dict, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("✅ Gemini API configured successfully")
else:
    logger.warning("⚠️ GEMINI_API_KEY not found in environment variables")

class GeminiService:
    """Service for interacting with Google Gemini AI"""
    
    def __init__(self):
        self.model = None
        if GEMINI_API_KEY:
            try:
                # Use Gemini 2.5 Flash (stable multimodal model)
                self.model = genai.GenerativeModel('models/gemini-2.5-flash')
                logger.info("✅ Gemini model initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Gemini model: {e}")
    
    async def get_farming_advice(self, 
                                 crop_type: str, 
                                 disease: Optional[str] = None,
                                 soil_type: Optional[str] = None,
                                 weather: Optional[str] = None) -> Dict[str, Any]:
        """
        Get AI-powered farming advice based on crop conditions
        
        Args:
            crop_type: Type of crop (e.g., "Tomato", "Maize")
            disease: Detected disease (if any)
            soil_type: Soil classification
            weather: Weather conditions
            
        Returns:
            Dictionary with advice and recommendations
        """
        if not self.model:
            return {
                "status": "error",
                "message": "Gemini API not configured"
            }
        
        try:
            # Build context-aware prompt
            prompt = f"""You are an expert agricultural advisor for African farmers. 
            
Crop Information:
- Crop Type: {crop_type}
"""
            if disease:
                prompt += f"- Disease Detected: {disease}\n"
            if soil_type:
                prompt += f"- Soil Type: {soil_type}\n"
            if weather:
                prompt += f"- Weather Conditions: {weather}\n"
            
            prompt += """
Please provide:
1. Immediate actions the farmer should take
2. Treatment recommendations (if disease detected)
3. Best practices for this crop
4. Expected timeline for recovery/growth
5. Cost-effective solutions suitable for African farmers

Keep advice practical, affordable, and specific to African farming conditions.
"""
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            return {
                "status": "success",
                "advice": response.text,
                "crop_type": crop_type,
                "context": {
                    "disease": disease,
                    "soil_type": soil_type,
                    "weather": weather
                }
            }
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def validate_plant_image(self, image_path: str) -> Dict[str, Any]:
        """
        Validate if uploaded image is a plant/crop/vegetable/fruit
        
        Args:
            image_path: Path to uploaded image
            
        Returns:
            Validation result with is_plant boolean
        """
        if not self.model:
            return {
                "status": "error",
                "message": "Gemini API not configured",
                "is_plant": True  # Allow by default if Gemini unavailable
            }
        
        try:
            vision_model = genai.GenerativeModel('models/gemini-2.5-flash')
            
            with open(image_path, 'rb') as img_file:
                image_data = img_file.read()
            
            prompt = """Analyze this image and determine if it shows a plant, crop, vegetable, fruit, leaf, or any agricultural/botanical subject.

Respond with ONLY ONE WORD:
- "YES" if the image shows any plant, crop, vegetable, fruit, leaf, tree, or agricultural subject
- "NO" if the image shows anything else (person, animal, object, building, etc.)

Your response:"""
            
            response = vision_model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_data}])
            answer = response.text.strip().upper()
            
            is_plant = "YES" in answer
            
            return {
                "status": "success",
                "is_plant": is_plant,
                "message": "Valid plant image" if is_plant else "Please upload a plant, crop, vegetable, or fruit image"
            }
            
        except Exception as e:
            logger.error(f"Gemini validation error: {e}")
            return {
                "status": "error",
                "message": str(e),
                "is_plant": False  # Reject by default on error - safer for production
            }
    
    async def generate_user_friendly_report(self, 
                                           disease_name: str, 
                                           confidence: float,
                                           crop_type: str = "crop") -> Dict[str, Any]:
        """
        Generate a user-friendly report from ML disease detection results
        
        Args:
            disease_name: Detected disease name from ML model
            confidence: Confidence score (0-1)
            crop_type: Type of crop
            
        Returns:
            User-friendly report with recommendations
        """
        if not self.model:
            return {
                "status": "error",
                "message": "Gemini API not configured"
            }
        
        try:
            prompt = f"""You are an expert agricultural consultant. A farmer's plant has been diagnosed with: {disease_name}

Search your knowledge about "{disease_name}" and provide a detailed, accurate report.

Format your response EXACTLY like this:

**What We Found:**
Explain what {disease_name} is, what causes it, and how it affects the plant. Be specific about symptoms.

**How Serious Is It:**
Rate the severity (Low/Medium/High concern) and explain the potential impact if left untreated.

**What To Do Now - Immediate Actions:**
1. [First specific action for {disease_name}]
2. [Second specific action for {disease_name}]
3. [Third specific action for {disease_name}]
4. [Fourth specific action for {disease_name}]
5. [Fifth specific action for {disease_name}]

**Treatment Options:**
List specific treatments, fungicides, or remedies that work for {disease_name}. Include both organic and chemical options with product names if possible.

**Prevention Tips:**
Specific prevention methods for {disease_name} - what conditions to avoid, resistant varieties, etc.

**Recovery Timeline:**
How long recovery takes with proper treatment for {disease_name}.

Be specific to {disease_name}. Do NOT give generic advice. Research this disease and provide accurate, actionable information."""
            
            response = self.model.generate_content(prompt)
            
            return {
                "status": "success",
                "report": response.text,
                "disease": disease_name,
                "confidence": confidence
            }
            
        except Exception as e:
            logger.error(f"Gemini report generation error: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def analyze_crop_image(self, image_path: str, crop_type: str) -> Dict[str, Any]:
        """
        Analyze crop image using Gemini Vision
        
        Args:
            image_path: Path to crop image
            crop_type: Type of crop
            
        Returns:
            Analysis results
        """
        if not self.model:
            return {
                "status": "error",
                "message": "Gemini API not configured"
            }
        
        try:
            # Use Gemini 2.5 Flash for image analysis (supports vision)
            vision_model = genai.GenerativeModel('models/gemini-2.5-flash')
            
            # Upload image
            with open(image_path, 'rb') as img_file:
                image_data = img_file.read()
            
            prompt = f"""Analyze this {crop_type} crop image and provide:
1. Overall health assessment
2. Any visible diseases or pests
3. Growth stage
4. Recommendations for the farmer
5. Urgency level (Low/Medium/High)

Focus on practical advice for African farmers."""
            
            response = vision_model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_data}])
            
            return {
                "status": "success",
                "analysis": response.text,
                "crop_type": crop_type
            }
            
        except Exception as e:
            logger.error(f"Gemini Vision error: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def get_market_insights(self, crop_type: str, current_price: float) -> Dict[str, Any]:
        """
        Get market insights and price predictions
        
        Args:
            crop_type: Type of crop
            current_price: Current market price
            
        Returns:
            Market insights and recommendations
        """
        if not self.model:
            return {
                "status": "error",
                "message": "Gemini API not configured"
            }
        
        try:
            prompt = f"""As an agricultural market expert for Africa:

Crop: {crop_type}
Current Price: ${current_price}

Provide:
1. Market trend analysis
2. Best time to sell (immediate vs wait)
3. Factors affecting price
4. Tips to get better prices
5. Alternative markets or buyers

Keep advice practical for African farmers."""
            
            response = self.model.generate_content(prompt)
            
            return {
                "status": "success",
                "insights": response.text,
                "crop_type": crop_type,
                "current_price": current_price
            }
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

# Global instance
gemini_service = GeminiService()
