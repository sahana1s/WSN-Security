"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Database, Wifi, Activity } from "lucide-react"

interface Node {
  id: string
  type: "sensor" | "consensus" | "blockchain"
  x: number
  y: number
  status: "active" | "compromised" | "offline"
  connections: string[]
}

interface NetworkTopologyProps {
  nodes: Node[]
  activeAttack?: string
  compromisedNodes: string[]
}

export function NetworkTopology({ nodes, activeAttack, compromisedNodes }: NetworkTopologyProps) {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case "sensor":
        return <Wifi className="h-4 w-4" />
      case "consensus":
        return <Shield className="h-4 w-4" />
      case "blockchain":
        return <Database className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getNodeColor = (node: Node) => {
    if (compromisedNodes.includes(node.id)) return "bg-red-500"
    if (node.status === "offline") return "bg-gray-400"
    switch (node.type) {
      case "sensor":
        return "bg-blue-500"
      case "consensus":
        return "bg-green-500"
      case "blockchain":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Network Topology</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-64 bg-gray-50 rounded-lg border">
          <svg className="absolute inset-0 w-full h-full">
            {/* Draw connections */}
            {nodes.map((node) =>
              node.connections.map((targetId) => {
                const target = nodes.find((n) => n.id === targetId)
                if (!target) return null
                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#e5e7eb"
                    strokeWidth="2"
                    strokeDasharray={
                      compromisedNodes.includes(node.id) || compromisedNodes.includes(targetId) ? "5,5" : "none"
                    }
                  />
                )
              }),
            )}
          </svg>

          {/* Draw nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: node.x, top: node.y }}
            >
              <div
                className={`w-12 h-12 rounded-full ${getNodeColor(node)} flex items-center justify-center text-white shadow-lg`}
              >
                {getNodeIcon(node.type)}
              </div>
              <div className="text-xs text-center mt-1 font-medium">{node.id}</div>
              {compromisedNodes.includes(node.id) && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                  ⚠
                </Badge>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs">Sensor Nodes</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs">Consensus Nodes</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-xs">Blockchain Nodes</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs">Compromised</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
