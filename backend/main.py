from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
import sys
import os

# Ensure simulation module is discoverable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from simulation.engine import SimulationEngine, SoilState
from simulation.data_pipelines import WeatherService, SatelliteService
from ai_models.yield_predictor import ai_model

app = FastAPI(title="Agri Digital Twin Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FarmCreate(BaseModel):
    name: str
    owner_id: str
    boundary_geojson: dict

class SimulationRequest(BaseModel):
    farm_id: str
    crop_type: str
    rainfall_modifier: float = 1.0
    fertilizer_modifier: float = 1.0

@app.get("/")
async def root():
    return {"message": "Agri Digital Twin Engine is Online", "version": "0.1.0"}

@app.post("/farms/")
async def create_farm(farm: FarmCreate):
    # Logic to save to PostGIS would go here
    return {"id": "uuid-placeholder", "status": "created"}

@app.get("/farms/{farm_id}/live-data")
async def get_farm_live_data(
    farm_id: str, 
    lat: float = 20.0112, 
    lon: float = 73.7902, 
    area: float = 5.0,
    seed_cost: float = 2000,
    fert_cost: float = 3000
):
    weather = WeatherService.get_forecast(lat, lon)
    satellite = SatelliteService.get_ndvi(lat, lon)
    
    # AI Prediction Inputs
    current_temp = weather[0]['temp'] if weather else 25.0
    current_rain = weather[0]['rainfall'] if weather else 0.0
    
    # AI Yield (Total Quintals)
    total_yield_q = ai_model.predict(80.0, satellite['ndvi'], current_rain, current_temp, area)
    
    # Financial Intelligence
    market_price_per_q = 3200 # Current market rate for regional crops
    gross_revenue = total_yield_q * market_price_per_q
    total_input_costs = (seed_cost + fert_cost) * area
    net_profit = gross_revenue - total_input_costs
    
    return {
        "farm_id": farm_id,
        "satellite": satellite,
        "weather_forecast": weather,
        "ai_prediction": {
            "estimated_yield_q": round(total_yield_q, 1), 
            "yield_per_acre": round(total_yield_q / area, 2) if area > 0 else 0,
            "gross_revenue_inr": round(gross_revenue, 2),
            "total_input_cost_inr": round(total_input_costs, 2),
            "net_profit_inr": round(net_profit, 2),
            "confidence": 0.89,
            "method": "XGBoost-Regressor"
        },
        "is_drought_warning": any(d['condition'] == "Drought" for d in weather) or satellite['ndvi'] < 0.5
    }

@app.post("/simulate/")
async def run_simulation(req: SimulationRequest):
    engine = SimulationEngine(days=120)
    
    # Mock weather data generation
    weather = [
        {"temp": 25 * req.rainfall_modifier, "rainfall": 5 * req.fertilizer_modifier} 
        for _ in range(120)
    ]
    
    initial_soil = SoilState(moisture=0.4, nitrogen=80.0, phosphorus=30.0, ph=6.8)
    
    result = engine.run_scenario(req.crop_type, weather, initial_soil)
    
    return {
        "farm_id": req.farm_id,
        "crop_type": req.crop_type,
        "predicted_yield": round(result["yield_prediction"], 2),
        "biomass_history": result["history"][:5], # Return first 5 days for preview
        "unit": "tons/hectare",
        "timestamp": datetime.now()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
