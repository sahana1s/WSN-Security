import json
import time
import paho.mqtt.publish as publish

frozen_data = {
    "Temperature": 30.0,
    "Humidity": 30.0,
    "Pressure": 1000.0,
    "node_id": "Node-2",
    "timestamp": time.time()
}

print("📟 Starting Constant Value Attack...")
for i in range(3):
    frozen_data["timestamp"] = time.time()
    publish.single("iot/sensors", json.dumps(frozen_data), hostname="broker.hivemq.com")
    print(f"[{i+1}] Sent frozen packet:", frozen_data)
    time.sleep(2)