"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Square, Activity, AlertCircle } from "lucide-react"

interface WSNSimulationProps {
  isRunning: boolean
  canStart: boolean
  currentIteration: number
  totalIterations: number
  logs: any[]
  blockchainLength: number
  anomalyCount: number
  onStart: () => void
  onStop: () => void
}

export function WSNSimulation({
  isRunning,
  canStart,
  currentIteration,
  totalIterations,
  logs = [],
  blockchainLength,
  anomalyCount,
  onStart,
  onStop,
}: WSNSimulationProps) {
  return (
    <Card className={`${isRunning ? "border-blue-500 shadow-lg" : canStart ? "border-gray-200" : "border-gray-100"}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Step 2: WSN Simulation</span>
          </div>
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "RUNNING" : currentIteration === totalIterations ? "COMPLETED" : "IDLE"}
          </Badge>
        </CardTitle>
        <CardDescription>10-iteration WSN simulation with consensus voting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canStart && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Start MQTT Publisher first to enable WSN simulation</AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-4">
          <Button
            onClick={onStart}
            disabled={!canStart || isRunning || currentIteration === totalIterations}
            className="flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>
              {currentIteration === totalIterations
                ? "Simulation Complete"
                : isRunning
                  ? "Running..."
                  : "Start WSN Simulation"}
            </span>
          </Button>
          <Button
            onClick={onStop}
            disabled={!isRunning}
            variant="outline"
            className="flex items-center space-x-2 bg-transparent"
          >
            <Square className="h-4 w-4" />
            <span>Stop</span>
          </Button>
        </div>

        <div className="text-sm">
          
          
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Blockchain Blocks:</span>
            <span className="font-bold ml-2 text-purple-600">{blockchainLength}</span>
          </div>
          <div>
            <span className="text-gray-600">Anomalies Detected:</span>
            <span className="font-bold ml-2 text-red-600">{anomalyCount}</span>
          </div>
          <div>
            <span className="text-gray-600">Normal Packets:</span>
            <span className="font-bold ml-2 text-green-600">{logs.length - anomalyCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
