import tensorflow as tf
import numpy as np
from PIL import Image
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Model paths
BASE_DIR = os.path.dirname(__file__)
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
MODEL_PATH = os.path.join(MODELS_DIR, "soil_classifier.keras")

# Image settings
IMG_SIZE = (180, 180)
CONFIDENCE_THRESHOLD = 0.60

# Class names
CLASS_NAMES = ['Alluvial soil', 'Black Soil', 'Clay soil', 'Red soil']

# Global model cache
_soil_model = None

# Comprehensive Soil Database
SOIL_INFO = {
    "Alluvial soil": {
        "crops": ["Wheat", "Rice", "Sugarcane", "Pulses", "Oilseeds"],
        "care": [
            "Maintain proper drainage to avoid waterlogging",
            "Use crop rotation to maintain fertility",
            "Add organic compost and green manure periodically",
            "Apply balanced NPK fertilizers: 120:60:40 kg/ha for wheat",
            "Practice mulching with crop residues to retain moisture"
        ],
        "notes": "Highly fertile soil deposited by rivers. Rich in potash and lime but deficient in nitrogen. Ideal for intensive cultivation.",
        "ph_range": "6.5-7.5",
        "texture": "Sandy to clayey loam",
        "water_retention": "Moderate to high"
    },
    "Black Soil": {
        "crops": ["Cotton", "Soybean", "Millets", "Groundnut", "Sunflower"],
        "care": [
            "CRITICAL: Avoid over-irrigation - soil has excellent moisture retention",
            "Perform deep plowing (20-25 cm) every 2-3 years",
            "Apply gypsum (2-4 tons/ha) if pH > 8.5",
            "Incorporate organic matter: FYM (10-15 tons/ha)",
            "Practice contour farming on slopes to prevent erosion"
        ],
        "notes": "Also called Regur or cotton soil. Rich in lime, iron, magnesia but poor in nitrogen and phosphorus. Self-plowing due to expansion-contraction.",
        "ph_range": "7.2-8.5",
        "texture": "Clayey to deep clayey",
        "water_retention": "Very high"
    },
    "Clay soil": {
        "crops": ["Paddy", "Potato", "Broccoli", "Cabbage", "Lettuce"],
        "care": [
            "ESSENTIAL: Add coarse sand (20-30%) or organic compost (15-20%)",
            "NEVER walk on or till when wet - causes severe compaction",
            "Apply heavy mulching (10-15 cm layer)",
            "Create raised beds (20-30 cm height) for vegetables",
            "Install drainage systems for excess water removal"
        ],
        "notes": "Heavy soil with very fine particles. Sticky when wet, hard when dry. Nutrient-rich but poorly aerated. Ideal for paddy rice.",
        "ph_range": "5.5-7.5",
        "texture": "Very fine, heavy, sticky",
        "water_retention": "Very high"
    },
    "Red soil": {
        "crops": ["Millets", "Groundnut", "Potatoes", "Mango", "Guava"],
        "care": [
            "CRITICAL: Regular NPK fertilizers (Red soil is nutrient-deficient)",
            "Heavy organic matter: FYM (20-25 tons/ha)",
            "Install drip irrigation - poor water retention",
            "Apply lime (1-2 tons/ha) to correct acidity",
            "Practice contour bunding on slopes to prevent erosion"
        ],
        "notes": "Formed from weathering of crystalline rocks. Red color due to iron oxide. Low fertility but good for plantations with proper fertilization.",
        "ph_range": "5.5-6.5",
        "texture": "Sandy to clay loam",
        "water_retention": "Low to moderate"
    }
}

def load_and_prepare_image(image_path):
    try:
        img = Image.open(image_path).convert("RGB")
        print(f"🖼️ Original image size: {img.size}")
        img = img.resize(IMG_SIZE)
        print(f"📏 Resized to: {IMG_SIZE}")
        img_array = np.array(img) / 255.0
        print(f"📊 Image array shape after normalization: {img_array.shape}")
        return np.expand_dims(img_array, axis=0)
    except Exception as e:
        print(f"❌ Failed to process image: {e}")
        return None


def load_soil_model():
    """Load soil model lazily (only once)"""
    global _soil_model
    if _soil_model is None:
        print("📦 Loading soil model...")
        if not os.path.exists(MODEL_PATH):
            print(f"❌ Model not found at {MODEL_PATH}")
            return None
        
        try:
            _soil_model = tf.keras.models.load_model(MODEL_PATH)
            print("✅ Soil model loaded successfully.")
        except Exception as e:
            print(f"❌ Error loading soil model: {e}")
            return None
    
    return _soil_model

def predict_soil_type(image_path):
    print(f"🔍 Predicting soil type for: {image_path}")

    img_tensor = load_and_prepare_image(image_path)
    if img_tensor is None:
        print("❌ Image preprocessing failed.")
        return None

    model = load_soil_model()
    if model is None:
        print("❌ Model loading failed.")
        return None

    try:
        print(f"🧪 Model input shape: {model.input_shape}")
        print(f"🧪 Model output shape: {model.output_shape}")
        print(f"🧪 Image tensor shape: {img_tensor.shape}")

        prediction = model.predict(img_tensor)[0]
        predicted_index = int(np.argmax(prediction))
        confidence = float(prediction[predicted_index]) * 100
        predicted_class = CLASS_NAMES[predicted_index]

        print(f"✅ Prediction: {predicted_class} ({confidence:.2f}%)")
        print(f"📊 Raw prediction values: {prediction}")
        
        # Get soil information
        soil_data = SOIL_INFO.get(predicted_class, {})
        
        # Validate confidence
        if confidence < CONFIDENCE_THRESHOLD * 100:
            logger.warning(f"Low confidence: {confidence:.2f}% < {CONFIDENCE_THRESHOLD*100:.0f}%")
        
        result = {
            "soil_type": predicted_class,
            "confidence": confidence / 100,  # Convert to 0-1 range
            "recommended_crops": soil_data.get("crops", []),
            "care_instructions": soil_data.get("care", []),
            "notes": soil_data.get("notes", ""),
            "ph_range": soil_data.get("ph_range", "N/A"),
            "texture": soil_data.get("texture", "N/A"),
            "water_retention": soil_data.get("water_retention", "N/A"),
            "all_predictions": {soil: float(pred) for soil, pred in zip(CLASS_NAMES, prediction)}
        }
        
        print(f"🎯 Returning result: {result}")
        return result
    except Exception as e:
        print(f"❌ Prediction failed: {e}")
        import traceback
        traceback.print_exc()
        return None