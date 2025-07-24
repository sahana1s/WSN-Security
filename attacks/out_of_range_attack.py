import json
import time
import paho.mqtt.publish as publish

bad_data = {
    "Temperature": -100.0,
    "Humidity": 200.0,
    "Pressure": 5000.0,
    "node_id": "Node-1",
    "timestamp": time.time()
}

print("📉 Starting Out-of-Range Attack...")
for i in range(3):
    bad_data["timestamp"] = time.time()
    publish.single("iot/sensors", json.dumps(bad_data), hostname="broker.hivemq.com")
    print(f"[{i+1}] Sent invalid packet:", bad_data)
    time.sleep(2)