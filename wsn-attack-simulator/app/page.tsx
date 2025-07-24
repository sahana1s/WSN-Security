"use client"

import { CardDescription } from "@/components/ui/card"

import { CardTitle } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RotateCcw, Activity, Database } from "lucide-react"
import { MQTTPublisher } from "@/components/mqtt-publisher"
import { WSNSimulation } from "@/components/wsn-simulation"
import { AttackExecution } from "@/components/attack-execution"
import { BlockchainViewer } from "@/components/blockchain-viewer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface SensorData {
  Temperature: number
  Humidity: number
  Pressure: number
  timestamp: number
  node_id: string
  packet_id: string
}

interface MQTTConfig {
  nodeId: string
  tempRange: [number, number]
  humidityRange: [number, number]
  pressureRange: [number, number]
  publishRate: number
}

interface SimulationLog {
  id: string
  timestamp: string
  iteration?: number
  type: "wsn_normal" | "wsn_anomaly" | "attack_injection" | "consensus_decision"
  sensorData: SensorData
  attackType?: string
  attackedData?: SensorData
  consensusVotes: number[]
  decision: string
  blockchainAdded: boolean
  latency: number
  impact?: string
  detected?: boolean
}

interface Block {
  index: number
  timestamp: number
  data: string
  previous_hash: string
  hash: string
  signer_id: string
}

// Simple Blockchain implementation
class SimpleBlockchain {
  private chain: Block[] = []

  constructor() {
    this.chain = [this.createGenesisBlock()]
  }

  private createGenesisBlock(): Block {
    return {
      index: 0,
      timestamp: Date.now(),
      data: "Genesis Block - WSN Blockchain Initialized",
      previous_hash: "0",
      hash: this.calculateHash("0", Date.now(), "Genesis Block"),
      signer_id: "Authority",
    }
  }

  private calculateHash(previousHash: string, timestamp: number, data: string): string {
    const content = `${previousHash}${timestamp}${data}`
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }

  addBlock(data: string, signerId: string): boolean {
    const lastBlock = this.chain[this.chain.length - 1]
    const newBlock: Block = {
      index: this.chain.length,
      timestamp: Date.now(),
      data,
      previous_hash: lastBlock.hash,
      hash: this.calculateHash(lastBlock.hash, Date.now(), data),
      signer_id: signerId,
    }

    this.chain.push(newBlock)
    return true
  }

  getChain(): Block[] {
    return [...this.chain]
  }

  getLength(): number {
    return this.chain.length
  }
}

// Consensus Node simulation
class ConsensusNode {
  constructor(private nodeId: string) {}

  vote(data: SensorData, isAttacked = false): number {
    // If data is marked as attacked, vote to reject
    if (isAttacked) {
      return -1
    }

    // Range validation
    if (
      data.Temperature < 0 ||
      data.Temperature > 60 ||
      data.Humidity < 0 ||
      data.Humidity > 100 ||
      data.Pressure < 950 ||
      data.Pressure > 1050
    ) {
      return -1
    }

    // Node ID validation
    if (!["Sensor-1", "Sensor-2"].includes(data.node_id)) {
      return -1
    }

    // Timestamp validation (not older than 60 seconds)
    if (Math.abs(Date.now() - data.timestamp) > 60000) {
      return -1
    }

    return 1 // Accept
  }
}

// Attack simulation functions
const applyAttack = (data: SensorData, attackType: string): { data: SensorData; impact: string } => {
  const attackedData = { ...data }
  let impact = ""

  switch (attackType) {
    case "dos":
      impact = "Flooding network with excessive packets"
      break
    case "mitm":
      attackedData.Temperature += 15
      attackedData.node_id = "MITM-Proxy"
      impact = "Data intercepted and modified in transit"
      break
    case "sybil":
      attackedData.node_id = "Malicious-Node-999"
      impact = "Fake node identity injected"
      break
    case "constant":
      attackedData.Temperature = 30.0
      attackedData.Humidity = 30.0
      attackedData.Pressure = 1013.25
      impact = "Constant values injected to mask sensor readings"
      break
    case "replay":
      attackedData.timestamp = data.timestamp - 120000 // 2 minutes old
      impact = "Old data replayed to confuse system"
      break
    case "blackhole":
      impact = "Packet dropped by malicious node"
      break
    case "hello_flood":
      attackedData.node_id = "FLOOD-" + Math.random().toString(36).substr(2, 5)
      impact = "Network flooded with hello messages"
      break
    case "range":
      attackedData.Temperature = Math.random() > 0.5 ? -10 : 70
      attackedData.Humidity = Math.random() > 0.5 ? -20 : 120
      attackedData.Pressure = Math.random() > 0.5 ? 800 : 1200
      impact = "Out-of-range values injected"
      break
    case "routing":
      impact = "Routing table manipulated"
      break
    case "sinkhole":
      attackedData.node_id = "Sinkhole-Node"
      impact = "Traffic redirected to malicious node"
      break
  }

  return { data: attackedData, impact }
}

const getAttackImpact = (attackType: string): string => {
  switch (attackType) {
    case "dos":
      return "Flooding network with excessive packets"
    case "mitm":
      return "Data intercepted and modified in transit"
    case "sybil":
      return "Fake node identity injected"
    case "constant":
      return "Constant values injected to mask sensor readings"
    case "replay":
      return "Old data replayed to confuse system"
    case "blackhole":
      return "Packet dropped by malicious node"
    case "hello_flood":
      return "Network flooded with hello messages"
    case "range":
      return "Out-of-range values injected"
    case "routing":
      return "Routing table manipulated"
    case "sinkhole":
      return "Traffic redirected to malicious node"
    default:
      return "Unknown attack impact"
  }
}

export default function WSNAttackSimulator() {
  // MQTT Publisher State
  const [mqttRunning, setMqttRunning] = useState(false)
  const [mqttConfig, setMqttConfig] = useState<MQTTConfig>({
    nodeId: "MQTT-Publisher",
    tempRange: [20, 30],
    humidityRange: [30, 70],
    pressureRange: [1000, 1025],
    publishRate: 2000,
  })
  const [mqttMessageCount, setMqttMessageCount] = useState(0)
  const [mqttLogs, setMqttLogs] = useState<string[]>([])
  const [currentSensorData, setCurrentSensorData] = useState<SensorData | null>(null)

  // WSN Simulation State
  const [wsnRunning, setWsnRunning] = useState(false)
  const [currentIteration, setCurrentIteration] = useState(0)
  const [simulationLogs, setSimulationLogs] = useState<SimulationLog[]>([])
  const [blockchain] = useState(new SimpleBlockchain())
  const [blockchainBlocks, setBlockchainBlocks] = useState<Block[]>([])

  // Attack Execution State
  const [selectedAttack, setSelectedAttack] = useState("none")

  // Consensus nodes
  const [consensusNodes] = useState([
    new ConsensusNode("Node-0"),
    new ConsensusNode("Node-1"),
    new ConsensusNode("Node-2"),
  ])

  // Real-time intervals
  const mqttInterval = useRef<NodeJS.Timeout>()
  const wsnInterval = useRef<NodeJS.Timeout>()

  // Generate realistic sensor data
  const generateSensorData = (): SensorData => {
    const sensorIds = ["Sensor-1", "Sensor-2"]
    return {
      Temperature: mqttConfig.tempRange[0] + Math.random() * (mqttConfig.tempRange[1] - mqttConfig.tempRange[0]),
      Humidity:
        mqttConfig.humidityRange[0] + Math.random() * (mqttConfig.humidityRange[1] - mqttConfig.humidityRange[0]),
      Pressure:
        mqttConfig.pressureRange[0] + Math.random() * (mqttConfig.pressureRange[1] - mqttConfig.pressureRange[0]),
      timestamp: Date.now(),
      node_id: sensorIds[Math.floor(Math.random() * sensorIds.length)],
      packet_id: `PKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  // MQTT Publisher Functions
  const startMQTTPublisher = () => {
    setMqttRunning(true)
    setMqttMessageCount(0)
    setMqttLogs([])

    mqttInterval.current = setInterval(() => {
      const sensorData = generateSensorData()
      setCurrentSensorData(sensorData)

      const timestamp = new Date().toLocaleTimeString()
      const logEntry = `[${timestamp}] ${sensorData.node_id}: T=${sensorData.Temperature.toFixed(1)}°C, H=${sensorData.Humidity.toFixed(1)}%, P=${sensorData.Pressure.toFixed(1)}hPa`

      setMqttLogs((prev) => [...prev.slice(-9), logEntry])
      setMqttMessageCount((prev) => prev + 1)
    }, mqttConfig.publishRate)
  }

  const stopMQTTPublisher = () => {
    setMqttRunning(false)
    if (mqttInterval.current) {
      clearInterval(mqttInterval.current)
    }
  }

  // WSN Simulation Functions
  const startWSNSimulation = () => {
    if (!mqttRunning) return

    setWsnRunning(true)
    setCurrentIteration(0)

    wsnInterval.current = setInterval(() => {
      if (currentSensorData && currentIteration < 10) {
        processWSNIteration(currentSensorData)
      }
    }, 3000) // Process every 3 seconds
  }

  const stopWSNSimulation = () => {
    setWsnRunning(false)
    if (wsnInterval.current) {
      clearInterval(wsnInterval.current)
    }
  }

  const processWSNIteration = (
    sensorData: SensorData,
    isAttackData = false,
    attackType?: string,
    originalData?: SensorData,
  ) => {
    const iteration = currentIteration + 1

    // Get consensus votes
    const votes = consensusNodes.map((node) => node.vote(sensorData, isAttackData))
    const normalVotes = votes.filter((v) => v === 1).length
    const anomalyVotes = votes.filter((v) => v === -1).length
    const decision = normalVotes > anomalyVotes ? "Normal" : "Anomaly"

    // Blockchain transaction - ONLY add if decision is Normal (not anomalous/attacked)
    let blockchainAdded = false
    let latency = 0
    if (decision === "Normal") {
      const startTime = performance.now()
      blockchain.addBlock(JSON.stringify(sensorData), "Node-0")
      latency = performance.now() - startTime
      blockchainAdded = true
      setBlockchainBlocks(blockchain.getChain())
    }

    // Create unified simulation log
    const logEntry: SimulationLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      iteration,
      type: isAttackData ? "attack_injection" : decision === "Anomaly" ? "wsn_anomaly" : "wsn_normal",
      sensorData: originalData || sensorData,
      attackType: attackType,
      attackedData: isAttackData ? sensorData : undefined,
      consensusVotes: votes,
      decision,
      blockchainAdded,
      latency,
      detected: isAttackData ? decision === "Anomaly" : undefined,
      impact: isAttackData ? getAttackImpact(attackType || "") : undefined,
    }

    setSimulationLogs((prev) => [...prev.slice(-19), logEntry])
    setCurrentIteration(iteration)

    // Stop after 10 iterations
    if (iteration >= 10) {
      setWsnRunning(false)
      if (wsnInterval.current) {
        clearInterval(wsnInterval.current)
      }
    }
  }

  // Attack Execution Functions
  const executeAttack = () => {
    if (!wsnRunning || !currentSensorData || selectedAttack === "none") return

    const { data: attackedData, impact } = applyAttack(currentSensorData, selectedAttack)

    // Process the attacked data through WSN iteration
    processWSNIteration(attackedData, true, selectedAttack, currentSensorData)
  }

  // Reset all systems
  const resetAll = () => {
    stopMQTTPublisher()
    stopWSNSimulation()
    setMqttMessageCount(0)
    setMqttLogs([])
    setCurrentIteration(0)
    setSimulationLogs([])
    setCurrentSensorData(null)
    setSelectedAttack("none")
    setBlockchainBlocks(blockchain.getChain().slice(0, 1))
  }

  useEffect(() => {
    return () => {
      if (mqttInterval.current) clearInterval(mqttInterval.current)
      if (wsnInterval.current) clearInterval(wsnInterval.current)
    }
  }, [])

  // Calculate statistics
  const anomalyCount = simulationLogs.filter((log) => log.decision === "Anomaly").length
  const attackCount = simulationLogs.filter((log) => log.type === "attack_injection").length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">WSN Attack Simulator</h1>
          <p className="text-gray-600 mt-2">
            Orchestrated MQTT → WSN → Attack workflow with real-time blockchain consensus
          </p>
        </div>

        {/* Real-time Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">MQTT Messages</p>
                  <p className="text-lg font-bold">{mqttMessageCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Blockchain Length</p>
                  <p className="text-lg font-bold">{blockchainBlocks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Button
                onClick={resetAll}
                variant="outline"
                className="w-full flex items-center space-x-2 bg-transparent"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset All</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Status */}
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <strong>Workflow Status:</strong>{" "}
            {!mqttRunning
              ? "Start MQTT Publisher first"
              : !wsnRunning
                ? "MQTT running → Start WSN Simulation"
                : currentIteration < 10
                  ? `WSN running (${currentIteration}/10) → Execute attacks to test resilience`
                  : "Simulation complete → Review results or reset"}
          </AlertDescription>
        </Alert>

        {/* Step 1: MQTT Publisher */}
        <MQTTPublisher
          isRunning={mqttRunning}
          config={mqttConfig}
          messageCount={mqttMessageCount}
          logs={mqttLogs}
          onStart={startMQTTPublisher}
          onStop={stopMQTTPublisher}
          onConfigChange={setMqttConfig}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Step 2: WSN Simulation */}
          <WSNSimulation
            isRunning={wsnRunning}
            canStart={mqttRunning}
            currentIteration={currentIteration}
            totalIterations={10}
            logs={simulationLogs.filter((log) => log.type === "wsn_normal" || log.type === "wsn_anomaly")}
            blockchainLength={blockchainBlocks.length}
            anomalyCount={anomalyCount}
            onStart={startWSNSimulation}
            onStop={stopWSNSimulation}
          />

          {/* Step 3: Attack Execution */}
          <AttackExecution
            canExecute={wsnRunning}
            selectedAttack={selectedAttack}
            attackLogs={simulationLogs.filter((log) => log.type === "attack_injection")}
            onAttackChange={setSelectedAttack}
            onExecuteAttack={executeAttack}
          />
        </div>

        {/* Blockchain Viewer */}
        <BlockchainViewer blocks={blockchainBlocks} isActive={wsnRunning || blockchainBlocks.length > 1} />

        {/* Unified Real-time Simulation Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Unified Simulation Logs</CardTitle>
            <CardDescription>Combined WSN simulation and attack injection logs in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            {simulationLogs.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No simulation data available. Start MQTT publisher and WSN simulation to see real-time logs.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-80 w-full">
                <div className="space-y-2">
                  {simulationLogs
                    .slice()
                    .reverse()
                    .map((log) => (
                      <div
                        key={log.id}
                        className={`border rounded p-3 ${
                          log.type === "attack_injection"
                            ? "bg-red-50 border-red-200"
                            : log.type === "wsn_anomaly"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">
                              {log.type === "attack_injection"
                                ? "🚨 ATTACK INJECTED"
                                : log.iteration
                                  ? `Iteration ${log.iteration}`
                                  : "Event"}
                            </span>
                            {log.attackType && (
                              <Badge variant="destructive" className="text-xs">
                                {log.attackType.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant={log.decision === "Anomaly" ? "destructive" : "default"}>
                              {log.decision}
                            </Badge>
                            {log.type === "attack_injection" && (
                              <Badge variant={log.detected ? "default" : "destructive"}>
                                {log.detected ? "DETECTED" : "BYPASSED"}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">
                              {log.type === "attack_injection" ? "Original Data:" : "Sensor Data:"}
                            </p>
                            <p>Node: {log.sensorData.node_id}</p>
                            <p>T: {log.sensorData.Temperature.toFixed(1)}°C</p>
                            <p>H: {log.sensorData.Humidity.toFixed(1)}%</p>
                            <p>P: {log.sensorData.Pressure.toFixed(1)}hPa</p>
                          </div>

                          {log.attackedData && (
                            <div>
                              <p className="font-medium text-gray-700">Attacked Data:</p>
                              <p>Node: {log.attackedData.node_id}</p>
                              <p
                                className={
                                  log.attackedData.Temperature !== log.sensorData.Temperature
                                    ? "text-red-600 font-bold"
                                    : ""
                                }
                              >
                                T: {log.attackedData.Temperature.toFixed(1)}°C
                              </p>
                              <p
                                className={
                                  log.attackedData.Humidity !== log.sensorData.Humidity ? "text-red-600 font-bold" : ""
                                }
                              >
                                H: {log.attackedData.Humidity.toFixed(1)}%
                              </p>
                              <p
                                className={
                                  log.attackedData.Pressure !== log.sensorData.Pressure ? "text-red-600 font-bold" : ""
                                }
                              >
                                P: {log.attackedData.Pressure.toFixed(1)}hPa
                              </p>
                            </div>
                          )}

                          <div>
                            <p className="font-medium text-gray-700">Consensus Result:</p>
                            <p>Votes: [{log.consensusVotes.join(", ")}]</p>
                            <p>Time: {log.timestamp}</p>
                            {log.blockchainAdded ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                                ✓ Added to Blockchain
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mt-1">
                                ✗ Rejected from Blockchain
                              </Badge>
                            )}
                          </div>
                        </div>

                        {log.impact && (
                          <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
                            <strong>Impact:</strong> {log.impact}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
