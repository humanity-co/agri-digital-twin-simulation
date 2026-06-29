import random
import time
import requests
import json

API_URL = "http://localhost:8000"

def simulate_iot_device(farm_id="farm-001"):
    """Simulates a soil moisture and temperature sensor sending data to the digital twin."""
    print(f"Starting IoT simulation for Farm: {farm_id}")
    
    while True:
        payload = {
            "farm_id": farm_id,
            "soil_moisture": round(random.uniform(0.2, 0.8), 2),
            "soil_temperature": round(random.uniform(15, 35), 1),
            "soil_ph": round(random.uniform(6.0, 7.5), 1),
            "timestamp": time.time()
        }
        
        # In a real scenario, this would go to an MQTT broker or a specific telemetry endpoint
        print(f"📡 Sending Telemetry: {json.dumps(payload)}")
        
        # Simulating endpoint contact (assuming we had a /telemetry endpoint)
        # requests.post(f"{API_URL}/telemetry/", json=payload)
        
        time.sleep(5)

if __name__ == "__main__":
    try:
        simulate_iot_device()
    except KeyboardInterrupt:
        print("IoT Simulation Stopped.")
