'use client'

import { useEffect, useState } from 'react'
import { useReadContract, useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Heart, MessageCircle, UserPlus, UserMinus } from 'lucide-react'
import { SocialFeedABI, CONTRACT_ADDRESS } from '../contracts/SocialFeedABI'
import { sdsClient, postCreatedSchema, postLikedSchema, postUnlikedSchema, userFollowedSchema, userUnfollowedSchema } from '../lib/somnia'

interface Post {
  id: bigint
  author: string
  content: string
  timestamp: bigint
  likes: bigint
}

export default function Feed({ refreshKey }: { refreshKey: number }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostNotification, setNewPostNotification] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const { address } = useAccount()

  const { data: postsData, refetch: refetchPosts } = useReadContract({
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
              setNewPostNotification('New post created!')
              setTimeout(() => setNewPostNotification(null), 5000)
            }
          },
          onError: (error) => {
            console.error('SDS subscription error:', error)
          },
          onlyPushChanges: true
        })

        return subscription?.unsubscribe
      } catch (error) {
        console.error('Failed to subscribe to SDS:', error)
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
  }, [refetchPosts])

  const handleLike = async (postId: number) => {
    if (!address) return

    try {
      // Check if already liked
      const isLiked = likedPosts.has(postId)
      if (isLiked) {
        // Unlike
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
      } else {
        // Like
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
        // Unfollow
        setFollowing(prev => {
          const newSet = new Set(prev)
          newSet.delete(userAddress)
          return newSet
        })
      } else {
        // Follow
        setFollowing(prev => new Set(prev).add(userAddress))
      }
      refetchFollowing()
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Social Chat</h1>
            <p className="text-xs text-gray-500">SDS Powered • {posts.length} messages</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Online</Badge>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No messages yet</p>
              <p className="text-gray-400 text-sm">Be the first to start the conversation!</p>
            </div>
          </div>
        ) : (
          posts.map((post, index) => {
            const isOwnPost = address && post.author.toLowerCase() === address.toLowerCase()
            return (
              <div key={post.id.toString()} className={`flex items-end gap-3 ${isOwnPost ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {!isOwnPost && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{post.author.slice(2, 4).toUpperCase()}</span>
                  </div>
                )}
                <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${isOwnPost ? 'order-1' : 'order-2'}`}>
                  {!isOwnPost && (
                    <div className="flex items-center gap-2 mb-1 px-3">
                      <span className="text-xs font-medium text-gray-700">{post.author.slice(0, 6)}...{post.author.slice(-4)}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(Number(post.timestamp) * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                    isOwnPost
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
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
                      <span className="text-xs text-gray-500">
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
                        className="h-6 px-2 text-xs text-gray-500 hover:text-blue-500 hover:bg-transparent"
                      >
                        {following.has(post.author) ? <UserMinus className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                        <span className="ml-1">{following.has(post.author) ? 'Unfollow' : 'Follow'}</span>
                      </Button>
                    </div>
                  )}
                </div>
                {isOwnPost && (
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">ME</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Notification Toast */}
      {newPostNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce z-50">
          {newPostNotification}
        </div>
      )}
    </div>
  )
}
