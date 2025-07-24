import paho.mqtt.client as mqtt
import json
import random
import time

client = mqtt.Client()
client.connect("broker.hivemq.com", 1883)

print("🧭 Simulating Routing Attack...")

while True:
    fake_route_info = {
        "node_id": f"Node-{random.randint(1, 25)}",
        "Temperature": random.uniform(15, 45),
        "Humidity": random.uniform(20, 90),
        "Pressure": random.uniform(950, 1050),
        "timestamp": time.time(),
        "next_hop": f"Node-{random.randint(1, 25)}",  # Routing info embedded
        "path_cost": random.randint(1, 5)
    }
    client.publish("iot/sensors", json.dumps(fake_route_info))
    print("🚨 Sent fake routing info:", fake_route_info)
    time.sleep(2)
