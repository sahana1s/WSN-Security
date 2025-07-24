"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Square, Wifi } from "lucide-react"

interface MQTTConfig {
  nodeId: string
  tempRange: [number, number]
  humidityRange: [number, number]
  pressureRange: [number, number]
  publishRate: number
}

interface MQTTPublisherProps {
  isRunning: boolean
  config: MQTTConfig
  messageCount: number
  logs: string[]
  onStart: () => void
  onStop: () => void
  onConfigChange: (config: MQTTConfig) => void
}

export function MQTTPublisher({
  isRunning,
  config,
  messageCount,
  logs,
  onStart,
  onStop,
  onConfigChange,
}: MQTTPublisherProps) {
  return (
    <Card className={`${isRunning ? "border-green-500 shadow-lg" : "border-gray-200"}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wifi className="h-5 w-5" />
            <span>Step 1: MQTT Publisher</span>
          </div>
          <Badge variant={isRunning ? "default" : "secondary"}>{isRunning ? "RUNNING" : "STOPPED"}</Badge>
        </CardTitle>
        <CardDescription>Configure and control sensor data publishing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nodeId">Node ID</Label>
            <Input
              id="nodeId"
              value={config.nodeId}
              onChange={(e) => onConfigChange({ ...config, nodeId: e.target.value })}
              disabled={isRunning}
            />
          </div>
          <div>
            <Label htmlFor="publishRate">Publish Rate (ms)</Label>
            <Input
              id="publishRate"
              type="number"
              value={config.publishRate}
              onChange={(e) => onConfigChange({ ...config, publishRate: Number.parseInt(e.target.value) })}
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Temperature Range (°C)</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={config.tempRange[0]}
                onChange={(e) =>
                  onConfigChange({ ...config, tempRange: [Number.parseFloat(e.target.value), config.tempRange[1]] })
                }
                disabled={isRunning}
                className="w-20"
              />
              <Input
                type="number"
                value={config.tempRange[1]}
                onChange={(e) =>
                  onConfigChange({ ...config, tempRange: [config.tempRange[0], Number.parseFloat(e.target.value)] })
                }
                disabled={isRunning}
                className="w-20"
              />
            </div>
          </div>
          <div>
            <Label>Humidity Range (%)</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={config.humidityRange[0]}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    humidityRange: [Number.parseFloat(e.target.value), config.humidityRange[1]],
                  })
                }
                disabled={isRunning}
                className="w-20"
              />
              <Input
                type="number"
                value={config.humidityRange[1]}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    humidityRange: [config.humidityRange[0], Number.parseFloat(e.target.value)],
                  })
                }
                disabled={isRunning}
                className="w-20"
              />
            </div>
          </div>
          <div>
            <Label>Pressure Range (hPa)</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={config.pressureRange[0]}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    pressureRange: [Number.parseFloat(e.target.value), config.pressureRange[1]],
                  })
                }
                disabled={isRunning}
                className="w-20"
              />
              <Input
                type="number"
                value={config.pressureRange[1]}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    pressureRange: [config.pressureRange[0], Number.parseFloat(e.target.value)],
                  })
                }
                disabled={isRunning}
                className="w-20"
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button onClick={onStart} disabled={isRunning} className="flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span>Start Publisher</span>
          </Button>
          <Button
            onClick={onStop}
            disabled={!isRunning}
            variant="outline"
            className="flex items-center space-x-2 bg-transparent"
          >
            <Square className="h-4 w-4" />
            <span>Stop Publisher</span>
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          Messages Published: <span className="font-bold text-green-600">{messageCount}</span>
        </div>

        <div>
          <Label>Real-time MQTT Logs</Label>
          <ScrollArea className="h-32 w-full border rounded p-2 bg-gray-50">
            {logs.length === 0 ? (
              <div className="text-xs text-gray-500 italic">No messages published yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-700 mb-1">
                  {log}
                </div>
              ))
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
