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

| **Attack Type**                 | **Category** | **Description**                                                                                            |
| ------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| **1. Denial of Service (DoS)**  | Critical     | Floods the network to exhaust resources or bandwidth, making legitimate communication impossible.          |
| **2. Man-in-the-Middle (MITM)** | Critical     | Intercepts and possibly alters data between two nodes without their knowledge.                             |
| **3. Sybil Attack**             | High         | A malicious node adopts multiple fake identities to influence consensus or voting mechanisms.              |
| **4. Constant Value Attack**    | Medium       | Repeatedly sends fixed sensor readings to mislead anomaly detection or simulate sensor malfunction.        |
| **5. Replay Attack**            | High         | Resends previously valid packets with old timestamps to impersonate legitimate data.                       |
| **6. Blackhole Attack**         | Critical     | A malicious node absorbs and discards packets, preventing them from reaching the destination.              |
| **7. Hello Flood Attack**       | High         | Sends excessive HELLO packets to mislead nodes into believing the attacker is a valid neighbor.            |
| **8. Out-of-Range Attack**      | Medium       | Sends sensor values outside the physical constraints (e.g., temperature of 200°C), triggering false logic. |
| **9. Routing Attack**           | High         | Manipulates routing paths to redirect traffic through malicious nodes or loops.                            |
| **10. Sinkhole Attack**         | Critical     | Attracts all nearby traffic by falsely advertising a high-quality route, then drops or alters the data.    |


Each attack can be run independently using ```python attacks/<attack_name>.py```

## Frontend Interface
- MQTT Configuration: Set node ID, publish interval, and sensor range.
- Attack Simulation: Select and trigger attacks dynamically from a dropdown.
- Real-time Log View: Chronological feed of WSN behavior, attacks, and decisions.
- Network Topology: Visual indicator of node status (healthy, offline, compromised).
- Blockchain View: Track which events are recorded on-chain.
