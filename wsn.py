import pandas as pd
import random
import time
import json
import hashlib
from time import perf_counter
from sklearn.ensemble import IsolationForest
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
import matplotlib.pyplot as plt
from IPython.display import clear_output

# SensorNode with keys and ML model
class SensorNode:
    def __init__(self, node_id):
        self.node_id = node_id
        self.private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        self.public_key = self.private_key.public_key()
        self.model = IsolationForest(contamination=0.1)
        self.train_local_model()

    def train_local_model(self):
        data = self.generate_data(200)
        self.model.fit(data[['Temperature', 'Humidity', 'Pressure']])

    def generate_data(self, num):
        readings = []
        for _ in range(num):
            readings.append({
                "Temperature": random.uniform(10, 50),
                "Humidity": random.uniform(10, 100),
                "Pressure": random.uniform(900, 1100)
            })
        return pd.DataFrame(readings)

    def sign_message(self, message):
        signature = self.private_key.sign(
            message.encode(),
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256()
        )
        return signature.hex()

    def detect_anomaly(self, data):
        df = pd.DataFrame([data], columns=['Temperature', 'Humidity', 'Pressure'])
        prediction = self.model.predict(df)
        return prediction[0]


class Block:
    def __init__(self, index, timestamp, data, previous_hash, signer_id):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.signer_id = signer_id
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        content = f"{self.index}{self.timestamp}{self.data}{self.signer_id}{self.previous_hash}"
        return hashlib.sha256(content.encode()).hexdigest()


class Blockchain:
    def __init__(self, authorized_nodes):
        self.authorized_nodes = authorized_nodes
        self.chain = [self.create_genesis_block()]

    def create_genesis_block(self):
        return Block(0, time.time(), "Genesis Block", "0", "Authority")

    def add_block(self, data, signer_node_id):
        if signer_node_id in self.authorized_nodes:
            last_block = self.chain[-1]
            new_block = Block(len(self.chain), time.time(), data, last_block.hash, signer_node_id)
            self.chain.append(new_block)
            return True
        else:
            print(f"Unauthorized signer attempt by {signer_node_id}")
            return False


import logging
import time
import json
import os
import matplotlib.pyplot as plt
from time import perf_counter
import paho.mqtt.client as mqtt
from threading import Event

# Clean up logging
for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)

# Logging setup
log_file = 'simulation_log.txt'
logging.basicConfig(filename=log_file, level=logging.INFO,
                    format='%(asctime)s - %(message)s', filemode='w')
console = logging.StreamHandler()
console.setLevel(logging.INFO)
console.setFormatter(logging.Formatter('%(message)s'))
logging.getLogger().addHandler(console)

print(f"Log file will be created at: {os.path.abspath(log_file)}\n")

# Placeholder classes (replace with your actual implementations)
class SensorNode:
    def __init__(self, node_id):
        self.node_id = node_id

    def detect_anomaly(self, data):
        temp = data.get("Temperature", 0)
        return 1 if 15 <= temp <= 45 else -1  # basic thresholding

class Blockchain:
    def __init__(self, node_ids):
        self.chain = []
        self.authorized_nodes = node_ids

    def add_block(self, data, signer):
        self.chain.append({'signer': signer, 'data': data})

# Initialize system
nodes = [SensorNode(f'Node-{i}') for i in range(3)]
authorized_node_ids = [node.node_id for node in nodes]
blockchain = Blockchain(authorized_node_ids)

temperature_vals, humidity_vals, pressure_vals, latencies = [], [], [], []
max_points = 30
plt.figure(figsize=(10, 8))

# Control variables
received_data = None
message_event = Event()
iteration = 0
max_iterations = 10

# MQTT callbacks
def on_connect(client, userdata, flags, rc):
    logging.info("Connected to MQTT broker")
    client.subscribe("iot/sensors")

def on_message(client, userdata, msg):
    global received_data
    try:
        payload = json.loads(msg.payload.decode())
        if all(k in payload for k in ["Temperature", "Humidity", "Pressure"]):
            received_data = payload
            message_event.set()
    except Exception as e:
        logging.warning(f"Failed to parse MQTT message: {e}")

# MQTT setup
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect("broker.hivemq.com", 1883, 60)
mqtt_client.loop_start()

# Main loop
while iteration < max_iterations:
    if not message_event.wait(timeout=10):
        logging.warning("No sensor data received within timeout.")
        continue

    data = received_data
    message_event.clear()

    results = [node.detect_anomaly(data) for node in nodes]
    final_decision = 1 if results.count(1) > results.count(-1) else -1

    logging.info(f"Iteration {iteration + 1}")
    logging.info(f"Sensor Reading: {data}")
    logging.info(f"Node Votes: {results} -> Final Decision: {'Normal' if final_decision == 1 else 'Anomaly'}")

    if final_decision == 1:
        signer_node = random.choice(authorized_node_ids)
        start_time = perf_counter()
        blockchain.add_block(str(data), signer_node)
        latency = perf_counter() - start_time
        logging.info(f"✅ Data added to Blockchain by {signer_node} | Latency: {latency:.6f}s")
    else:
        latency = 0
        logging.info("⚠️ Anomaly detected — data NOT added to blockchain.")

    logging.info(f"Blockchain Length: {len(blockchain.chain)}")
    logging.info("-" * 60)

    # Store data
    temperature_vals.append(data['Temperature'])
    humidity_vals.append(data['Humidity'])
    pressure_vals.append(data['Pressure'])
    latencies.append(latency)

    if len(temperature_vals) > max_points:
        temperature_vals.pop(0)
        humidity_vals.pop(0)
        pressure_vals.pop(0)
        latencies.pop(0)

    iteration += 1

mqtt_client.loop_stop()
mqtt_client.disconnect()

import plotly.graph_objects as go
import pandas as pd

# Prepare the DataFrame
df = pd.DataFrame({
    "Time": list(range(len(temperature_vals))),
    "Temperature": temperature_vals,
    "Humidity": humidity_vals,
    "Pressure": pressure_vals,
    "Latency": latencies
})

# Identify dropped packets (latency = 0)
dropped_packets = df[df["Latency"] == 0]["Time"].tolist()

# Create an animated figure
fig = go.Figure()

metrics = ["Temperature", "Humidity", "Pressure", "Latency"]
colors = ["red", "blue", "green", "purple"]

# Add lines for each metric
for metric, color in zip(metrics, colors):
    fig.add_trace(go.Scatter(x=df["Time"], y=df[metric],
                             mode="lines+markers",
                             name=metric,
                             line=dict(color=color)))

# Add drop indicators (X markers for dropped packets)
if dropped_packets:
    drop_y = [df.loc[i, "Latency"] for i in dropped_packets]
    fig.add_trace(go.Scatter(
        x=dropped_packets,
        y=drop_y,
        mode="markers+text",
        name="Dropped Packets",
        marker=dict(color="black", symbol="x", size=12),
        text=["Dropped"] * len(dropped_packets),
        textposition="top center",
        showlegend=True
    ))

# Layout and animation settings
fig.update_layout(
    title="Sensor Data & Blockchain Latency Over Time",
    xaxis_title="Time Step",
    yaxis_title="Values",
    updatemenus=[dict(type="buttons",
                      showactive=False,
                      buttons=[dict(label="Play",
                                    method="animate",
                                    args=[None, {"frame": {"duration": 500, "redraw": True},
                                                 "fromcurrent": True}])])],
    sliders=[dict(steps=[dict(method="animate",
                              args=[[str(i)],
                                    {"frame": {"duration": 300, "redraw": True},
                                     "mode": "immediate"}],
                              label=str(i))
                         for i in range(len(df))])]
)

# Add animation frames
fig.frames = [
    go.Frame(data=[go.Scatter(y=df[metric][:i+1]) for metric in metrics], name=str(i))
    for i in range(len(df))
]

fig.show()
