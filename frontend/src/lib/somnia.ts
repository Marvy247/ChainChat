import { defineChain, createPublicClient, http } from 'viem'
import { SDK } from '@somnia-chain/streams'

export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://dream-rpc.somnia.network'] }, public: { http: ['https://dream-rpc.somnia.network'] } },
} as const)

// Schemas for social feed events
export const postCreatedSchema = 'uint256 postId, address author, string content, uint256 timestamp'
export const postLikedSchema = 'uint256 postId, address liker, uint256 totalLikes'
export const postUnlikedSchema = 'uint256 postId, address unliker, uint256 totalLikes'
export const userFollowedSchema = 'address follower, address followed'
export const userUnfollowedSchema = 'address follower, address unfollowed'
export const profileUpdatedSchema = 'address user, string username, string bio'

const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http('https://dream-rpc.somnia.network'),
})

export const sdk = new SDK({ public: publicClient })
export const sdsClient = sdk.streams
