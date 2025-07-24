"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Database } from "lucide-react"

interface Block {
  index: number
  timestamp: number
  data: string
  previous_hash: string
  hash: string
  signer_id: string
}

interface BlockchainViewerProps {
  blocks: Block[]
  isActive: boolean
}

export function BlockchainViewer({ blocks, isActive }: BlockchainViewerProps) {
  return (
    <Card className={`${isActive ? "border-purple-500 shadow-lg" : "border-gray-200"}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Blockchain Ledger</span>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>{blocks.length} BLOCKS</Badge>
        </CardTitle>
        <CardDescription>Real-time blockchain updates from Node 0</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full">
          <div className="space-y-2">
            {blocks.length === 0 ? (
              <div className="text-sm text-gray-500 italic">No blocks yet...</div>
            ) : (
              blocks
                .slice()
                .reverse()
                .map((block, index) => (
                  <div key={block.index} className="border rounded p-3 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Block #{block.index}</span>
                      <Badge variant="outline" className="text-xs">
                        {block.signer_id}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">Hash:</span> {block.hash.slice(0, 16)}...
                      </div>
                      <div>
                        <span className="font-medium">Previous:</span> {block.previous_hash.slice(0, 16)}...
                      </div>
                      <div>
                        <span className="font-medium">Timestamp:</span> {new Date(block.timestamp).toLocaleTimeString()}
                      </div>
                      {block.index > 0 && (
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          <span className="font-medium">Data:</span> {block.data.slice(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
