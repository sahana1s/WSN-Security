import paho.mqtt.client as mqtt
import json
import time

client = mqtt.Client()
client.connect("broker.hivemq.com", 1883)

print("🕳️ Simulating Sinkhole Attack...")

while True:
    payload = {
        "node_id": "Node-1",
        "Temperature": 25,
        "Humidity": 50,
        "Pressure": 1000,
        "timestamp": time.time(),
        "routing_metric": 0  # Very low cost to attract traffic
    }
    client.publish("iot/sensors", json.dumps(payload))
    print("📡 Sinkhole Node Broadcasting:", payload)
    time.sleep(1)
