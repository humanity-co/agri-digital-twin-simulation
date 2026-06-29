import numpy as np
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class SoilState:
    moisture: float  # 0 to 1
    nitrogen: float  # mg/kg
    phosphorus: float # mg/kg
    ph: float        # 0 to 14

class CropGrowthModel:
    """
    Simulates crop growth based on environmental factors.
    Uses a simplified version of the Decision Support System for Agrotechnology Transfer (DSSAT) logic.
    """
    def __init__(self, crop_type: str):
        self.crop_type = crop_type
        # Growth coefficients (Simplified)
        self.params = {
            "cotton": {"base_temp": 15, "opt_temp": 28, "water_demand": 0.8},
            "soybean": {"base_temp": 10, "opt_temp": 25, "water_demand": 0.6},
            "maize": {"base_temp": 8, "opt_temp": 30, "water_demand": 0.7}
        }.get(crop_type.lower(), {"base_temp": 10, "opt_temp": 25, "water_demand": 0.5})

    def calculate_daily_growth(self, temp: float, soil: SoilState, rainfall: float) -> float:
        """Returns biomass increase for the day (0 to 1 index)"""
        
        # 1. Temperature Stress (Bell curve around optimum)
        temp_factor = np.exp(-((temp - self.params["opt_temp"])**2) / 50.0)
        
        # 2. Water Stress
        water_availability = soil.moisture + (rainfall / 100.0)
        water_factor = min(1.0, water_availability / self.params["water_demand"])
        
        # 3. Nutrient Stress (Simplified)
        nutrient_factor = min(1.0, soil.nitrogen / 50.0)
        
        # Combined growth rate
        daily_growth = temp_factor * water_factor * nutrient_factor
        return max(0.0, daily_growth)

class SimulationEngine:
    def __init__(self, days: int = 120):
        self.days = days

    def run_scenario(self, crop_type: str, weather_data: List[Dict], initial_soil: SoilState):
        model = CropGrowthModel(crop_type)
        biomass = 0.0
        soil = initial_soil
        
        history = []
        
        for day in range(self.days):
            daily_weather = weather_data[day]
            growth = model.calculate_daily_growth(
                daily_weather['temp'], 
                soil, 
                daily_weather['rainfall']
            )
            biomass += growth
            
            # Simplified soil depletion
            soil.nitrogen -= (growth * 0.1)
            soil.moisture = max(0.0, soil.moisture + (daily_weather['rainfall'] / 100.0) - 0.05)
            
            history.append({
                "day": day,
                "biomass": biomass,
                "soil_moisture": soil.moisture
            })
            
        return {
            "final_biomass": biomass,
            "yield_prediction": biomass * 0.5, # Yield as fraction of biomass
            "history": history
        }

if __name__ == "__main__":
    # Test Run
    engine = SimulationEngine(days=30)
    weather = [{"temp": 25 + np.random.randn(), "rainfall": 2 * np.random.random()} for _ in range(30)]
    soil = SoilState(moisture=0.5, nitrogen=100.0, phosphorus=40.0, ph=6.5)
    
    result = engine.run_scenario("cotton", weather, soil)
    print(f"Simulation Result: {result['final_biomass']:.2f} biomass accumulated.")
