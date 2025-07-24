"use client"

import { Label } from "@/components/ui/label"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap, Shield, AlertTriangle } from "lucide-react"

interface AttackLog {
  timestamp: string
  attackType: string
  targetData: any
  injectedData: any
  detected: boolean
  impact: string
}

interface AttackExecutionProps {
  canExecute: boolean
  selectedAttack: string
  attackLogs: any[] // Changed from simulationLogs to attackLogs
  onAttackChange: (attack: string) => void
  onExecuteAttack: () => void
}

const attackTypes = [
  { value: "none", label: "No Attack", criticality: "low" as const },
  { value: "dos", label: "DoS Attack", criticality: "critical" as const },
  { value: "mitm", label: "Man-in-the-Middle", criticality: "critical" as const },
  { value: "sybil", label: "Sybil Attack", criticality: "high" as const },
  { value: "constant", label: "Constant Value Attack", criticality: "medium" as const },
  { value: "replay", label: "Replay Attack", criticality: "high" as const },
  { value: "blackhole", label: "Blackhole Attack", criticality: "critical" as const },
  { value: "hello_flood", label: "Hello Flood Attack", criticality: "high" as const },
  { value: "range", label: "Out of Range Attack", criticality: "medium" as const },
  { value: "routing", label: "Routing Attack", criticality: "high" as const },
  { value: "sinkhole", label: "Sinkhole Attack", criticality: "critical" as const },
]

export function AttackExecution({
  canExecute,
  selectedAttack,
  attackLogs = [], // Add default empty array
  onAttackChange,
  onExecuteAttack,
}: AttackExecutionProps) {
  const currentAttack = attackTypes.find((a) => a.value === selectedAttack)

  // Remove the filter since attackLogs is already filtered
  // const attackLogs = simulationLogs.filter((log) => log.type === "attack_injection")

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "critical":
        return "bg-red-200 text-red-900 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className={`${selectedAttack !== "none" ? "border-red-500 shadow-lg" : "border-gray-200"}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Step 3: Attack Execution</span>
          </div>
          {currentAttack && currentAttack.value !== "none" && (
            <Badge className={getCriticalityColor(currentAttack.criticality)}>
              {currentAttack.criticality.toUpperCase()} RISK
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Inject anomalous packets during simulation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canExecute && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Start WSN simulation first to enable attack execution</AlertDescription>
          </Alert>
        )}

        <div>
          <Label className="text-sm font-medium">Attack Type</Label>
          <Select value={selectedAttack} onValueChange={onAttackChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select attack type" />
            </SelectTrigger>
            <SelectContent>
              {attackTypes.map((attack) => (
                <SelectItem key={attack.value} value={attack.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{attack.label}</span>
                    <Badge
                      variant={
                        attack.criticality === "critical"
                          ? "destructive"
                          : attack.criticality === "high"
                            ? "destructive"
                            : attack.criticality === "medium"
                              ? "default"
                              : "secondary"
                      }
                      className="ml-2 text-xs"
                    >
                      {attack.criticality}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onExecuteAttack}
          disabled={!canExecute || selectedAttack === "none"}
          className="w-full flex items-center space-x-2"
          variant={selectedAttack !== "none" ? "destructive" : "default"}
        >
          <Zap className="h-4 w-4" />
          <span>
            {selectedAttack === "none" ? "Select Attack Type" : `Execute ${currentAttack?.label || "Attack"}`}
          </span>
        </Button>

        <div className="text-sm text-gray-600">
          Attacks Executed: <span className="font-bold text-red-600">{attackLogs.length}</span>
        </div>
      </CardContent>
    </Card>
  )
}
