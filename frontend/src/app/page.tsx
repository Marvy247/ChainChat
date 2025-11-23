'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useAccount, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import Feed from '../components/Feed'
import SDSStatusIndicator from '../components/SDSStatusIndicator'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Textarea } from '../components/ui/textarea'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Moon, Sun, User, MessageSquare } from 'lucide-react'
import { SocialFeedABI, CONTRACT_ADDRESS } from '../contracts/SocialFeedABI'
import { toast } from 'sonner'

export default function Home() {
  const [postContent, setPostContent] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)
  const [sdsConnected, setSdsConnected] = useState(true)
  const { address } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const { data: postCountData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SocialFeedABI,
    functionName: 'getPostCount',
  })

  const { data: profileData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SocialFeedABI,
    functionName: 'profiles',
    args: address ? [address] : undefined,
  })

  useEffect(() => {
    if (profileData) {
      const [user, bioText, , , exists] = profileData as [string, string, bigint, bigint, boolean]
      if (exists) {
        setUsername(user)
        setBio(bioText)
      }
    }
  }, [profileData])

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Transaction completed successfully!')
      setTxHash(undefined)
      setShowProfile(false)
      setRefreshKey(prev => prev + 1) // Trigger feed refresh
    }
  }, [isConfirmed])

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
          <CardTitle className="text-center">Welcome to ChainChat</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Connect your wallet to start interacting on the blockchain social platform!</p>
            <p className="text-sm text-gray-400 mb-6">Create posts, like content, follow users, and experience real-time social interactions powered by Somnia Data Streams.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const createPost = async () => {
    if (!address || !postContent.trim()) {
      toast.error('Please enter post content!')
      return
    }
    console.log('Creating post with content:', postContent)
    console.log('Contract address:', CONTRACT_ADDRESS)
    console.log('User address:', address)

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: SocialFeedABI,
        functionName: 'createPost',
        args: [postContent],
      })
      console.log('Transaction hash:', hash)
      setTxHash(hash)
      setPostContent('')
    } catch (error) {
      console.error('Full error object:', error)
      toast.error(`Error creating post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const updateProfile = async () => {
    if (!address) return
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: SocialFeedABI,
        functionName: 'updateProfile',
        args: [username, bio],
      })
      console.log('Profile update transaction hash:', hash)
      setTxHash(hash)
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(`Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 dark:from-gray-900 dark:via-gray-800 dark:to-black text-white flex items-center justify-center p-4 transition-colors duration-300 pt-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl relative z-10">
        <div className="flex flex-col gap-4">
          <Card className="w-full lg:w-[600px] backdrop-blur-xl bg-white/10 dark:bg-black/30 border-white/20 shadow-2xl">
            <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center justify-between">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ChainChat</span>
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-300 border-green-400/30 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                  SDS Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {username && (
                <div className="mb-6 p-3 bg-gray-800 dark:bg-gray-700 rounded-lg">
                  <div className="font-semibold text-white dark:text-gray-100">{username}</div>
                  {bio && <div className="text-sm text-gray-400 dark:text-gray-300 mt-1">{bio}</div>}
                </div>
              )}

              {/* Post Creation Input */}
              <div className="mb-6">
                <Textarea
                  placeholder="What's on your mind? (max 280 characters)"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  maxLength={280}
                  rows={3}
                  className="mb-2"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{postContent.length}/280</span>
                  <Button
                    onClick={createPost}
                    disabled={isPending || !postContent.trim() || postContent.length > 280}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {isPending ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Dialog open={showProfile} onOpenChange={setShowProfile}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          maxLength={50}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          maxLength={160}
                          rows={3}
                        />
                        <span className="text-sm text-gray-500">{bio.length}/160</span>
                      </div>
                      <Button onClick={updateProfile} disabled={isPending}>
                        {isPending ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <p className="text-sm text-gray-300">
                Real-time social interactions powered by Somnia Data Streams. All posts, likes, and follows are stored immutably on-chain.
              </p>
            </CardContent>
          </Card>

          {/* SDS Status Indicator */}
          <SDSStatusIndicator 
            isConnected={sdsConnected} 
            postCount={postCountData ? Number(postCountData) : 0}
          />
        </div>
        <Feed refreshKey={refreshKey} onSDSStatusChange={setSdsConnected} />
      </div>
    </div>
  )
}
