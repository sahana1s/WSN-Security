import paho.mqtt.client as mqtt
import json
import random
import time

client = mqtt.Client()
client.connect("broker.hivemq.com", 1883)

print("🕵️‍♂️ Simulating MITM Attack: Intercepting and modifying data...")

while True:
    original = {
        "node_id": f"Node-{random.randint(1, 25)}",
        "Temperature": round(random.uniform(20, 35), 2),
        "Humidity": round(random.uniform(30, 60), 2),
        "Pressure": round(random.uniform(960, 1040), 2),
        "timestamp": time.time()
    }

    # MITM modifies it slightly
    original["Temperature"] += 10  # Injected change

    client.publish("iot/sensors", json.dumps(original))
    print("✏️ Modified & Sent:", original)
    time.sleep(2)
