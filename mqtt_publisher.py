# import paho.mqtt.publish as publish
# import json
# import random
# import time

# # Configuration
# NORMAL_INTERVAL = 5  # seconds between messages
# BURST_INTERVAL = 30  # inject anomaly burst every ~30 seconds
# BURST_DURATION = 2   # how many anomalies to send in each burst

# counter = 0
# anomaly_burst_active = False
# burst_messages_left = 0

# while True:
#     # Determine if we should enter an anomaly burst
#     if counter % (BURST_INTERVAL // NORMAL_INTERVAL) == 0 and counter != 0:
#         anomaly_burst_active = True
#         burst_messages_left = random.randint(1, 2)  # inject 1 or 2 anomalies
#         print(f"🚨 Anomaly burst triggered at message {counter + 1}")

#     if anomaly_burst_active and burst_messages_left > 0:
#         # Anomalous data
#         data = {
#             "Temperature": round(random.uniform(70, 100), 2),
#             "Humidity": round(random.uniform(0, 10), 2),
#             "Pressure": round(random.uniform(500, 700), 2)
#         }
#         burst_messages_left -= 1
#         if burst_messages_left == 0:
#             anomaly_burst_active = False
#     else:
#         # Normal data
#         data = {
#             "Temperature": round(random.uniform(20, 40), 2),
#             "Humidity": round(random.uniform(30, 80), 2),
#             "Pressure": round(random.uniform(950, 1050), 2)
#         }

#     payload = json.dumps(data)
#     publish.single("iot/sensors", payload, hostname="broker.hivemq.com")
#     print(f"[{counter + 1}] Published:", payload)
    
#     counter += 1
#     time.sleep(NORMAL_INTERVAL)

import paho.mqtt.publish as publish
import json
import random
import time
import socket

# Configuration
NORMAL_INTERVAL = 5  # seconds between messages
BURST_INTERVAL = 30  # inject anomaly burst every ~30 seconds
BURST_DURATION = 2   # how many anomalies to send in each burst
MQTT_BROKER = "broker.hivemq.com"  # Try "test.mosquitto.org" if needed
MQTT_PORT = 1883  # Default MQTT port
MQTT_TOPIC = "iot/sensors"

counter = 0
anomaly_burst_active = False
burst_messages_left = 0

while True:
    try:
        # Determine if we should enter an anomaly burst
        if counter % (BURST_INTERVAL // NORMAL_INTERVAL) == 0 and counter != 0:
            anomaly_burst_active = True
            burst_messages_left = random.randint(1, 2)  # inject 1 or 2 anomalies
            print(f"🚨 Anomaly burst triggered at message {counter + 1}")

        if anomaly_burst_active and burst_messages_left > 0:
            # Anomalous data
            data = {
                "Temperature": round(random.uniform(70, 100), 2),
                "Humidity": round(random.uniform(0, 10), 2),
                "Pressure": round(random.uniform(500, 700), 2)
            }
            burst_messages_left -= 1
            if burst_messages_left == 0:
                anomaly_burst_active = False
        else:
            # Normal data
            data = {
                "Temperature": round(random.uniform(20, 40), 2),
                "Humidity": round(random.uniform(30, 80), 2),
                "Pressure": round(random.uniform(950, 1050), 2)
            }

        payload = json.dumps(data)

        # Attempt publishing with a timeout
        publish.single(
            topic=MQTT_TOPIC,
            payload=payload,
            hostname=MQTT_BROKER,
            port=MQTT_PORT,
            keepalive=60,
            client_id=f"publisher-{random.randint(1,10000)}"
        )

        print(f"[{counter + 1}]  Published:", payload)

    except socket.timeout:
        print(f"[{counter + 1}]  Timeout error: could not connect to broker at {MQTT_BROKER}")
    except Exception as e:
        print(f"[{counter + 1}]  Unexpected error: {e}")

    counter += 1
    time.sleep(NORMAL_INTERVAL)
