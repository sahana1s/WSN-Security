import paho.mqtt.client as mqtt
import json
import random
import time

client = mqtt.Client()
client.connect("broker.hivemq.com", 1883)

print("📣 Simulating HELLO Flood Attack...")

while True:
    hello_msg = {
        "hello": True,
        "node_id": f"Unknown-Node-{random.randint(100, 999)}",
        "timestamp": time.time()
    }
    client.publish("iot/sensors", json.dumps(hello_msg))
    print("📣 HELLO flooded:", hello_msg)
    time.sleep(0.5)
