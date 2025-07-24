from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import importlib
import random
import threading
import time
import hashlib
import logging
import os
from time import perf_counter

app = Flask(__name__)

MODEL_PATH = "models/autoencoder_model.keras"
SCALER_PATH = "models/scaler.pkl"
THRESHOLD_PATH = "models/reconstruction_threshold.pkl"
ATTACK_MODULES = {
    "none": None,
    "constant": "attacks.constant_value_attack",
    "range": "attacks.out_of_range_attack",
    "replay": "attacks.replay_attack",
    "sybil": "attacks.sybil_attack"
}

model = tf.keras.models.load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
threshold = joblib.load(THRESHOLD_PATH)

# Blockchain classes
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
            logging.warning(f"Unauthorized signer attempt by {signer_node_id}")
            return False

# SensorNode and logging
class SensorNode:
    def __init__(self, node_id):
        self.node_id = node_id

    def detect_anomaly(self, data):
        node_id = data.get("node_id")
        if node_id not in authorized_node_ids:
            logging.warning(f"Sybil Attack Detected: {node_id} not authorized")
            return -1

        temp = data.get("Temperature", 0)
        humid = data.get("Humidity", 0)
        press = data.get("Pressure", 0)

        if not (0 <= temp <= 60 and 0 <= humid <= 100 and 950 <= press <= 1050):
            logging.warning(f"Out-of-Range values: {temp}, {humid}, {press}")
            return -1

        if temp == humid == 30.0:
            logging.warning("Constant Value Attack Detected")
            return -1

        timestamp = data.get("timestamp", time.time())
        if abs(time.time() - timestamp) > 60:
            logging.warning("Replay Attack Detected")
            return -1

        df = pd.DataFrame([[temp, humid, press]], columns=['Temperature', 'Humidity', 'Pressure'])
        scaled = scaler.transform(df)
        recon = model.predict(scaled, verbose=0)
        loss = np.mean(np.square(scaled - recon))
        return 1 if loss < threshold else -1

# Globals
simulation_logs = []
current_attack = "none"
authorized_node_ids = [f"Node-{i}" for i in range(3)]
nodes = [SensorNode(node_id) for node_id in authorized_node_ids]
blockchain = Blockchain(authorized_node_ids)
is_simulating = False

# Sensor simulation
def generate_sensor_data():
    return {
        "Temperature": random.uniform(20, 30),
        "Humidity": random.uniform(30, 70),
        "Pressure": random.uniform(1000, 1025),
        "timestamp": time.time(),
        "node_id": random.choice(authorized_node_ids)
    }

def apply_attack(data, attack_type):
    if attack_type == "none" or ATTACK_MODULES.get(attack_type) is None:
        return data
    module = importlib.import_module(ATTACK_MODULES[attack_type])
    return module.attack(data)

# Background thread for simulation
def run_simulation(attack_type):
    global simulation_logs, is_simulating
    simulation_logs.clear()
    is_simulating = True

    for i in range(10):
        if not is_simulating:
            break

        raw = generate_sensor_data()
        attacked = apply_attack(raw.copy(), attack_type)
        results = [node.detect_anomaly(attacked) for node in nodes]
        decision = 1 if results.count(1) > results.count(-1) else -1

        if decision == 1:
            signer = random.choice(authorized_node_ids)
            start = perf_counter()
            blockchain.add_block(str(attacked), signer)
            latency = perf_counter() - start
        else:
            latency = 0

        simulation_logs.append({
            "step": i + 1,
            "original": raw,
            "attacked": attacked,
            "votes": results,
            "final_decision": "Normal" if decision == 1 else "Anomaly",
            "latency": latency
        })
        time.sleep(1)

    is_simulating = False

@app.route('/simulate', methods=['POST'])
def simulate():
    global current_attack, is_simulating
    if is_simulating:
        return jsonify({"status": "already running"}), 409

    data = request.get_json()
    current_attack = data.get("attack", "none").lower()

    if current_attack not in ATTACK_MODULES:
        return jsonify({"error": "Invalid attack type"}), 400

    thread = threading.Thread(target=run_simulation, args=(current_attack,))
    thread.start()
    return jsonify({"message": "Simulation started", "attack": current_attack})

@app.route('/log', methods=['GET'])
def get_log():
    return jsonify(simulation_logs)

@app.route('/visualize', methods=['GET'])
def visualize():
    if not simulation_logs:
        return jsonify({"error": "Simulation not run yet."}), 400

    steps = list(range(1, len(simulation_logs) + 1))
    latency = [entry["latency"] for entry in simulation_logs]
    dropped = [i for i, l in enumerate(latency) if l == 0]

    return jsonify({
        "summary": {
            "total_steps": len(simulation_logs),
            "anomalies_detected": len(dropped),
            "attack": current_attack
        },
        "latency_plot": {
            "x": steps,
            "y": latency,
            "dropped_steps": dropped
        },
        "blockchain_length": len(blockchain.chain),
        "logs": simulation_logs
    })

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO, format='%(message)s')
    app.run(debug=True)
