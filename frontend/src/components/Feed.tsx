'use client'

import { useEffect, useState } from 'react'
import { useReadContract, useAccount, useWriteContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Heart, MessageCircle, UserPlus, UserMinus } from 'lucide-react'
import { SocialFeedABI, CONTRACT_ADDRESS } from '../contracts/SocialFeedABI'
import { sdsClient, postCreatedSchema, postLikedSchema, postUnlikedSchema, userFollowedSchema, userUnfollowedSchema } from '../lib/somnia'
import { generateAvatar, getAvatarInitials } from '../lib/avatar'
import LoadingSkeleton from './LoadingSkeleton'

interface Post {
  id: bigint
  author: string
  content: string
  timestamp: bigint
  likes: bigint
}

interface FeedProps {
  refreshKey: number
  onSDSStatusChange?: (connected: boolean) => void
}

export default function Feed({ refreshKey, onSDSStatusChange }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostNotification, setNewPostNotification] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const { data: postsData, refetch: refetchPosts, isLoading: isLoadingPosts } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SocialFeedABI,
    functionName: 'getPosts',
    args: [0n, 20n], // Get first 20 posts
  })

  const { data: likedData, refetch: refetchLikes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SocialFeedABI,
    functionName: 'hasLiked',
    args: address ? [0n, address] : undefined, // This will be updated per post
  })

  const { data: followingData, refetch: refetchFollowing } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SocialFeedABI,
    functionName: 'isFollowing',
    args: address ? [address, '0xAA8Bd99ACb7c3ad8b81C12bC249D6dD44Bed2DFF'] : undefined, 
  })

  useEffect(() => {
    if (postsData) {
      setPosts(postsData as Post[])
    }
  }, [postsData])

  // Refresh posts when refreshKey changes (after new post creation)
  useEffect(() => {
    if (refreshKey > 0) {
      refetchPosts()
    }
  }, [refreshKey, refetchPosts])

  // Initialize SDS for real-time updates
  useEffect(() => {
    const subscribeToEvents = async () => {
      try {
        onSDSStatusChange?.(true)
        const subscription = await sdsClient.subscribe({
          eventContractSources: [CONTRACT_ADDRESS],
          topicOverrides: [], // Will be set for specific events
          ethCalls: [{
            to: CONTRACT_ADDRESS,
            data: '0x8b6e6b6f' // getPostCount() selector
          }],
          onData: (data) => {
            refetchPosts() // Update feed on new posts
            // Show notification for new post
            if (data && data.length > 0) {
              setNewPostNotification('🎉 New post created!')
              setTimeout(() => setNewPostNotification(null), 5000)
            }
          },
          onError: (error) => {
            console.error('SDS subscription error:', error)
            onSDSStatusChange?.(false)
          },
          onlyPushChanges: true
        })

        return subscription?.unsubscribe
      } catch (error) {
        console.error('Failed to subscribe to SDS:', error)
        onSDSStatusChange?.(false)
        // Fallback to polling
        const interval = setInterval(() => {
          refetchPosts()
        }, 5000)
        return () => clearInterval(interval)
      }
    }

    const unsubscribe = subscribeToEvents()
    return () => {
      unsubscribe?.then(fn => fn?.())
    }
  }, [refetchPosts, onSDSStatusChange])

  const handleLike = async (postId: number) => {
    if (!address) return

    try {
      // Check if already liked
      const isLiked = likedPosts.has(postId)
      if (isLiked) {
        // Unlike - call unlikePost function
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: SocialFeedABI,
          functionName: 'unlikePost',
          args: [BigInt(postId)],
        })
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
      } else {
        // Like - call likePost function
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: SocialFeedABI,
          functionName: 'likePost',
          args: [BigInt(postId)],
        })
        setLikedPosts(prev => new Set(prev).add(postId))
      }
      refetchPosts()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleFollow = async (userAddress: string) => {
    if (!address || userAddress === address) return

    try {
      const isFollowing = following.has(userAddress)
      if (isFollowing) {
        // Unfollow - call contract
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: SocialFeedABI,
          functionName: 'unfollowUser',
          args: [userAddress as `0x${string}`],
        })
        setFollowing(prev => {
          const newSet = new Set(prev)
          newSet.delete(userAddress)
          return newSet
        })
      } else {
        // Follow - call contract
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: SocialFeedABI,
          functionName: 'followUser',
          args: [userAddress as `0x${string}`],
        })
        setFollowing(prev => new Set(prev).add(userAddress))
      }
      refetchFollowing()
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">ChainChat</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">SDS Powered • {posts.length} messages</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Online</Badge>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLoadingPosts ? (
          <LoadingSkeleton />
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 space-y-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10 animate-pulse">
                  <MessageCircle className="w-12 h-12 text-blue-400" />
                </div>
                <div className="absolute top-0 right-1/4 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="space-y-2">
                <p className="text-white text-xl font-bold">Welcome to ChainChat! 🎉</p>
                <p className="text-gray-300 text-sm max-w-sm mx-auto">
                  Be the first to start the conversation on this decentralized social platform.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 max-w-md mx-auto text-left">
                <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-400/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💬</div>
                    <div>
                      <p className="text-sm font-semibold text-white">Create Posts</p>
                      <p className="text-xs text-gray-400">Share your thoughts with the community</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-400/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚡</div>
                    <div>
                      <p className="text-sm font-semibold text-white">Real-time Updates</p>
                      <p className="text-xs text-gray-400">See new posts instantly with SDS</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-pink-500/10 to-pink-500/5 border border-pink-400/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔗</div>
                    <div>
                      <p className="text-sm font-semibold text-white">On-Chain Social</p>
                      <p className="text-xs text-gray-400">All interactions stored on blockchain</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          posts.map((post, index) => {
            const isOwnPost = address && post.author.toLowerCase() === address.toLowerCase()
            return (
              <div key={post.id.toString()} className={`flex items-end gap-3 ${isOwnPost ? 'justify-end' : 'justify-start'} animate-fade-in transition-all duration-300 hover:scale-[1.02]`}>
                {!isOwnPost && (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                    style={{ background: generateAvatar(post.author) }}
                  >
                    <span className="text-white font-bold text-xs drop-shadow-md">{getAvatarInitials(post.author)}</span>
                  </div>
                )}
                <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${isOwnPost ? 'order-1' : 'order-2'}`}>
                  {!isOwnPost && (
                    <div className="flex items-center gap-2 mb-1 px-3">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{post.author.slice(0, 6)}...{post.author.slice(-4)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(Number(post.timestamp) * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                    isOwnPost
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-600'
                  }`}>
                    <p className="text-sm leading-relaxed">{post.content}</p>
                  </div>
                  <div className={`flex items-center gap-2 mt-1 px-3 ${isOwnPost ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLike(Number(post.id))}
                        className={`h-6 px-2 text-xs hover:bg-transparent ${
                          isOwnPost ? 'text-blue-200 hover:text-white' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${likedPosts.has(Number(post.id)) ? 'fill-current text-red-500' : ''}`} />
                        <span className="ml-1">{post.likes.toString()}</span>
                      </Button>
                      <Button size="sm" variant="ghost" className={`h-6 px-2 text-xs hover:bg-transparent ${
                        isOwnPost ? 'text-blue-200 hover:text-white' : 'text-gray-500 hover:text-blue-500'
                      }`}>
                        <MessageCircle className="w-3 h-3" />
                        <span className="ml-1">0</span>
                      </Button>
                    </div>
                    {isOwnPost && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(Number(post.timestamp) * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    )}
                  </div>
                  {address && post.author !== address && (
                    <div className="mt-1 px-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFollow(post.author)}
                        className="h-6 px-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-transparent"
                      >
                        {following.has(post.author) ? <UserMinus className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                        <span className="ml-1">{following.has(post.author) ? 'Unfollow' : 'Follow'}</span>
                      </Button>
                    </div>
                  )}
                </div>
                {isOwnPost && (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/20"
                    style={{ background: generateAvatar(post.author) }}
                  >
                    <span className="text-white font-bold text-xs drop-shadow-md">ME</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Notification Toast */}
      {newPostNotification && (
        <div className="fixed top-20 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl animate-slide-in-right z-50 backdrop-blur-sm border border-white/20 flex items-center gap-3">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">{newPostNotification}</span>
        </div>
      )}
    </div>
  )
}
