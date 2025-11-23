'use client'

import { useState, useEffect } from 'react'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Activity, Zap, Users, Box } from 'lucide-react'
import { useBlockNumber } from 'wagmi'

interface SDSStatusProps {
  isConnected: boolean
  postCount: number
}

export default function SDSStatusIndicator({ isConnected, postCount }: SDSStatusProps) {
  const [postsPerSec, setPostsPerSec] = useState(0)
  const [lastPostCount, setLastPostCount] = useState(postCount)
  const [activeUsers, setActiveUsers] = useState(0)
  const { data: blockNumber } = useBlockNumber({ watch: true })

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = postCount - lastPostCount
      setPostsPerSec(diff)
      setLastPostCount(postCount)
      // Simulate active users based on post activity
      setActiveUsers(Math.max(1, Math.floor(Math.random() * 10) + diff))
    }, 1000)

    return () => clearInterval(interval)
  }, [postCount, lastPostCount])

  return (
    <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/30 border-white/20 shadow-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            Live Network Status
          </h3>
          <Badge 
            variant="secondary" 
            className={`text-xs ${
              isConnected 
                ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                : 'bg-red-500/20 text-red-300 border-red-400/30'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-400/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-gray-300">Posts/sec</span>
            </div>
            <div className="text-2xl font-bold text-white">{postsPerSec}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-400/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-gray-300">Active Users</span>
            </div>
            <div className="text-2xl font-bold text-white">{activeUsers}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg p-3 border border-green-400/20">
            <div className="flex items-center gap-2 mb-1">
              <Box className="w-3 h-3 text-green-400" />
              <span className="text-xs text-gray-300">Latest Block</span>
            </div>
            <div className="text-lg font-bold text-white truncate">
              {blockNumber ? `#${blockNumber.toString().slice(-6)}` : '---'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-400/20">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-gray-300">Total Posts</span>
            </div>
            <div className="text-2xl font-bold text-white">{postCount}</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          Powered by Somnia Data Streams - Real-time on-chain updates
        </div>
      </CardContent>
    </Card>
  )
}
