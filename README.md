# WSN Attack Simulator — Secure Wireless Sensor Network Framework

This project simulates and defends Wireless Sensor Networks (WSNs) using a full-stack approach that combines **blockchain-based logging**, **machine learning–driven anomaly detection**, and **real-time attack simulation and visualization**. It features a **React/Next.js dashboard**, a **Flask-based backend**, and multiple WSN-specific attack modules.

## Key Features

- **MQTT Sensor Simulation** – Configurable node ID, publish rate, and sensor ranges.
- **Dual-Layer Anomaly Detection** – RSA-based authentication + Autoencoder ML model.
- **Blockchain Logging** – Validated packets are immutably logged using Proof of Authority.
- **Attack Simulation Toolkit** – Supports 10+ real-world WSN attacks (e.g., Sybil, Replay, DoS).
- **Interactive Frontend** – Real-time logs, anomaly indicators, and network topology visualization.
- **Consensus Voting** – Three-node federated voting system for anomaly validation.

---

## Running the Project

> Make sure you have Python, Node.js, and `pip` installed.

### 1. Setup the Frontend (React + Next.js)
```
cd .\wsn-attack-simulator\
npm install
npm run dev
```
Opens the simulator dashboard at ```http://localhost:3000/```
Use the UI to start the publisher, choose attack types, and monitor logs.

### 2. Setup the Backend (in Python Virtual Environment)

Terminal 1: Start the MQTT Publisher
```
py mqtt_publisher.py
```

Terminal 2: Start the Main Backend
```
wsn.py
```

Terminal 3: Run the Attack Module
```
attacks/<attack.py>
# Example:
python attacks/replay_attack.py
```
---

## Attack Spectrum
You can simulate the following attack types:
- Replay Attack
- Sybil Attack
- Constant Value Attack
- Out-of-Range Attack
- Blackhole Attack
- Sinkhole Attack
- Hello Flood Attack
- DoS (Denial of Service)
- Routing Attack
- Man-in-the-Middle (MITM)
Each attack can be run independently using ```python attacks/<attack_name>.py```

## Frontend Interface
- MQTT Configuration: Set node ID, publish interval, and sensor range.
- Attack Simulation: Select and trigger attacks dynamically from a dropdown.
- Real-time Log View: Chronological feed of WSN behavior, attacks, and decisions.
- Network Topology: Visual indicator of node status (healthy, offline, compromised).
- Blockchain View: Track which events are recorded on-chain.
