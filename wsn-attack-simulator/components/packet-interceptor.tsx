"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"

interface PacketData {
  id: string
  source: string
  destination: string
  data: any
  attack_type?: string
  criticality: "low" | "medium" | "high" | "critical"
  timestamp: number
  suspicious_indicators: string[]
}

interface PacketInterceptorProps {
  pendingPacket: PacketData | null
  onAccept: () => void
  onReject: () => void
  isWaiting: boolean
}

export function PacketInterceptor({ pendingPacket, onAccept, onReject, isWaiting }: PacketInterceptorProps) {
  if (!pendingPacket && !isWaiting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Packet Interceptor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>No packets intercepted. Start simulation to monitor network traffic.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (isWaiting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Packet Interceptor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>Waiting for next packet...</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

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
    <Card className="border-2 border-yellow-400 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>Packet Intercepted - Decision Required</span>
          </div>
          <Badge className={getCriticalityColor(pendingPacket.criticality)}>
            {pendingPacket.criticality.toUpperCase()} RISK
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Source:</p>
            <p className="font-mono text-sm">{pendingPacket.source}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Destination:</p>
            <p className="font-mono text-sm">{pendingPacket.destination}</p>
          </div>
        </div>

        {pendingPacket.attack_type && (
          <div>
            <p className="text-sm font-medium text-gray-700">Detected Attack:</p>
            <Badge variant="destructive">{pendingPacket.attack_type}</Badge>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700">Packet Data:</p>
          <div className="bg-gray-50 p-2 rounded text-xs font-mono">{JSON.stringify(pendingPacket.data, null, 2)}</div>
        </div>

        {pendingPacket.suspicious_indicators.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700">Suspicious Indicators:</p>
            <ul className="list-disc list-inside text-sm text-red-600">
              {pendingPacket.suspicious_indicators.map((indicator, index) => (
                <li key={index}>{indicator}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-4 pt-4">
          <Button onClick={onAccept} className="flex-1 flex items-center space-x-2 bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4" />
            <span>Accept Packet</span>
          </Button>
          <Button onClick={onReject} variant="destructive" className="flex-1 flex items-center space-x-2">
            <XCircle className="h-4 w-4" />
            <span>Reject Packet</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
