import os
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API key from environment
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
WEATHER_API_BASE = "http://api.weatherapi.com/v1"

def get_weather_forecast(location: str = "auto:ip", days: int = 7) -> Dict[str, Any]:
    """
    Fetch real weather forecast from WeatherAPI.com
    
    Args:
        location: City name, coordinates, or 'auto:ip' for automatic detection
        days: Number of days to forecast (1-10)
    
    Returns:
        Dictionary with weather forecast data
    """
    if not WEATHER_API_KEY:
        logger.error("WEATHER_API_KEY not found in environment variables")
        return {
            "status": "error",
            "message": "Weather API key not configured"
        }
    
    try:
        # Fetch forecast data
        url = f"{WEATHER_API_BASE}/forecast.json"
        params = {
            "key": WEATHER_API_KEY,
            "q": location,
            "days": min(days, 10),  # API supports max 10 days
            "aqi": "yes"  # Include air quality data
        }
        
        logger.info(f"Fetching weather for location: {location}")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract and format forecast data
        forecast_days = []
        for day in data["forecast"]["forecastday"]:
            forecast_days.append({
                "date": day["date"],
                "temperature": day["day"]["avgtemp_c"],
                "max_temp": day["day"]["maxtemp_c"],
                "min_temp": day["day"]["mintemp_c"],
                "condition": day["day"]["condition"]["text"],
                "condition_icon": day["day"]["condition"]["icon"],
                "humidity": day["day"]["avghumidity"],
                "wind_kph": day["day"]["maxwind_kph"],
                "precipitation_mm": day["day"]["totalprecip_mm"],
                "chance_of_rain": day["day"]["daily_chance_of_rain"],
                "uv_index": day["day"]["uv"],
                "sunrise": day["astro"]["sunrise"],
                "sunset": day["astro"]["sunset"],
                "details": {
                    "morning": f"{day['hour'][6]['temp_c']:.1f}°C" if len(day['hour']) > 6 else "N/A",
                    "afternoon": f"{day['hour'][14]['temp_c']:.1f}°C" if len(day['hour']) > 14 else "N/A",
                    "evening": f"{day['hour'][18]['temp_c']:.1f}°C" if len(day['hour']) > 18 else "N/A",
                    "night": f"{day['hour'][22]['temp_c']:.1f}°C" if len(day['hour']) > 22 else "N/A"
                }
            })
        
        return {
            "status": "success",
            "location": {
                "name": data["location"]["name"],
                "region": data["location"]["region"],
                "country": data["location"]["country"],
                "lat": data["location"]["lat"],
                "lon": data["location"]["lon"],
                "timezone": data["location"]["tz_id"],
                "localtime": data["location"]["localtime"]
            },
            "current": {
                "temp_c": data["current"]["temp_c"],
                "condition": data["current"]["condition"]["text"],
                "condition_icon": data["current"]["condition"]["icon"],
                "humidity": data["current"]["humidity"],
                "wind_kph": data["current"]["wind_kph"],
                "feels_like": data["current"]["feelslike_c"],
                "uv_index": data["current"]["uv"]
            },
            "forecast": forecast_days
        }
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Weather API request failed: {e}")
        return {
            "status": "error",
            "message": f"Failed to fetch weather data: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Weather processing error: {e}")
        return {
            "status": "error",
            "message": f"Error processing weather data: {str(e)}"
        }


if __name__ == "__main__":
    # Test the function
    result = get_weather_forecast("New Delhi")
    if result["status"] == "success":
        print(f"\n📍 Location: {result['location']['name']}, {result['location']['country']}")
        print(f"🌡️ Current: {result['current']['temp_c']}°C - {result['current']['condition']}")
        print("\n📊 7-Day Forecast:")
        for day in result["forecast"]:
            print(f"{day['date']}: {day['temperature']}°C - {day['condition']}")
    else:
        print(f"❌ Error: {result['message']}")
