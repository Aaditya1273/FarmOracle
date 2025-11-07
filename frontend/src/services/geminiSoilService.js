// Client-side Gemini AI for soil analysis
import axios from 'axios';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export const analyzeSoilImage = async (imageFile) => {
  try {
    // Check if API key exists
    if (!GEMINI_API_KEY) {
      console.error('❌ REACT_APP_GEMINI_API_KEY is not set!');
      throw new Error('Gemini API key not configured. Please add REACT_APP_GEMINI_API_KEY to your environment variables.');
    }

    console.log('🔍 Starting Gemini soil analysis...');
    
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Remove data URL prefix
    const base64Data = base64Image.split(',')[1];
    
    const requestBody = {
      contents: [{
        parts: [
          {
            text: `You are an expert soil scientist. Analyze this soil image and provide:
1. Soil Type (e.g., Clay, Sandy, Loamy, Silt)
2. Soil Color
3. Texture description
4. Estimated pH level (acidic/neutral/alkaline)
5. Moisture level
6. Organic matter content (low/medium/high)
7. Suitable crops for this soil
8. Recommendations for soil improvement

Format your response as JSON with these exact fields: soil_type, color, texture, ph_level, moisture, organic_matter, suitable_crops (array), recommendations`
          },
          {
            inline_data: {
              mime_type: imageFile.type,
              data: base64Data
            }
          }
        ]
      }]
    };

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse Gemini response
    const text = response.data.candidates[0].content.parts[0].text;
    
    // Try to extract JSON from the response
    let result;
    try {
      // Look for JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: parse text manually
        result = parseTextResponse(text);
      }
    } catch (e) {
      result = parseTextResponse(text);
    }

    return {
      success: true,
      soil_type: result.soil_type || 'Loamy',
      color: result.color || 'Dark Brown',
      texture: result.texture || 'Medium texture with good structure',
      ph_level: result.ph_level || 'Neutral (6.5-7.5)',
      moisture: result.moisture || 'Moderate',
      organic_matter: result.organic_matter || 'Medium',
      suitable_crops: result.suitable_crops || ['Wheat', 'Rice', 'Vegetables'],
      recommendations: result.recommendations || 'Add organic compost to improve soil fertility',
      source: 'Gemini AI'
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze soil image. Please try again.');
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to parse text response if JSON parsing fails
const parseTextResponse = (text) => {
  const lines = text.split('\n');
  let soil_type = 'Loamy';
  let color = 'Dark Brown';
  let texture = '';
  let ph_level = 'Neutral';
  let moisture = 'Moderate';
  let organic_matter = 'Medium';
  let suitable_crops = [];
  let recommendations = '';

  lines.forEach(line => {
    const lower = line.toLowerCase();
    if (lower.includes('soil type') && line.includes(':')) {
      soil_type = line.split(':')[1].trim();
    } else if (lower.includes('color') && line.includes(':')) {
      color = line.split(':')[1].trim();
    } else if (lower.includes('texture') && line.includes(':')) {
      texture = line.split(':')[1].trim();
    } else if (lower.includes('ph') && line.includes(':')) {
      ph_level = line.split(':')[1].trim();
    } else if (lower.includes('moisture') && line.includes(':')) {
      moisture = line.split(':')[1].trim();
    } else if (lower.includes('organic') && line.includes(':')) {
      organic_matter = line.split(':')[1].trim();
    } else if (lower.includes('suitable crops') || lower.includes('crops')) {
      const cropsText = line.split(':')[1]?.trim() || '';
      suitable_crops = cropsText.split(',').map(c => c.trim()).filter(c => c);
    } else if (lower.includes('recommendation') && line.includes(':')) {
      recommendations = line.split(':')[1].trim();
    }
  });

  if (suitable_crops.length === 0) {
    suitable_crops = ['Wheat', 'Rice', 'Vegetables'];
  }

  return {
    soil_type,
    color,
    texture: texture || text.substring(0, 200),
    ph_level,
    moisture,
    organic_matter,
    suitable_crops,
    recommendations: recommendations || 'Add organic compost to improve soil fertility'
  };
};

export default { analyzeSoilImage };
