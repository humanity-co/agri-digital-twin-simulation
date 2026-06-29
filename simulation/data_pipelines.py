import random
from datetime import datetime, timedelta

class WeatherService:
    @staticmethod
    def get_forecast(lat: float, lon: float):
        """Simulates fetching 7-day weather forecast for coordinates."""
        # In production, this would call OpenWeatherMap or NASA POWER API
        forecast = []
        base_temp = 28.0 if 18 < lat < 22 else 22.0 # Maharashtra typicals
        
        for i in range(7):
            date = datetime.now() + timedelta(days=i)
            forecast.append({
                "date": date.strftime("%Y-%m-%d"),
                "temp": round(base_temp + random.uniform(-3, 5), 1),
                "rainfall": round(max(0, random.uniform(-5, 15)), 2),
                "humidity": random.randint(40, 80),
                "condition": random.choice(["Sunny", "Cloudy", "Rainy", "Drought"])
            })
        return forecast

class SatelliteService:
    @staticmethod
    def get_ndvi(lat: float, lon: float):
        """Simulates fetching NDVI (Vegetation Index) from Sentinel-2 satellite data."""
        # NDVI ranges from -1 to 1. In healthy farms it's 0.6 - 0.9.
        # Drought stress lowers it to 0.3 - 0.5.
        base_ndvi = 0.75
        is_drought = random.random() < 0.1 # 10% chance of detecting drought
        
        if is_drought:
            ndvi = round(random.uniform(0.3, 0.45), 2)
        else:
            ndvi = round(random.uniform(0.65, 0.85), 2)
            
        return {
            "ndvi": ndvi,
            "canopy_cover": f"{int(ndvi * 100)}%",
            "water_stress_index": round(random.uniform(0.1, 0.4), 2),
            "status": "Healthy" if ndvi > 0.6 else "Stressed",
            "last_capture": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
