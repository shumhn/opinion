'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useState, useEffect, useCallback } from 'react'
import { PROGRAM_ID, encryptData, createPostPDA, DISCRIMINATORS, u64LE } from '@/lib/solana'

// DEMO MODE: Set to false for real blockchain transactions
const DEMO_MODE = false

export interface Post {
  id: number
  encryptedTitle: string
  encryptedContent: string
  encryptedTopic: string
  author: string
  createdAt: number
  totalComments: number
  totalFeedback: number
  // Decrypted versions (only available to author)
  title?: string
  content?: string
  topic?: string
}

export function usePosts() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)

  // Create a new encrypted post
  const createPost = useCallback(async (title: string, content: string, topic: string) => {
    if (!publicKey && !DEMO_MODE) throw new Error('Wallet not connected')

    setLoading(true)
    try {
      // DEMO MODE: Skip blockchain and just update local state
      if (DEMO_MODE) {
        const encryptedTitle = encryptData(title)
        const encryptedContent = encryptData(content)
        const encryptedTopic = encryptData(topic)
        const postId = Date.now()

        const newPost: Post = {
          id: postId,
          encryptedTitle,
          encryptedContent,
          encryptedTopic,
          author: publicKey?.toString() || 'demo-user',
          createdAt: Date.now(),
          totalComments: 0,
          totalFeedback: 0,
          title,
          content,
          topic
        }

        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
        setPosts(prev => [newPost, ...prev])
        return 'demo-signature-' + postId
      }
      // Ensure wallet is connected
      if (!publicKey) throw new Error('Wallet not connected')

      // Client-side encryption
      const encryptedTitle = encryptData(title)
      const encryptedContent = encryptData(content)
      const encryptedTopic = encryptData(topic)

      const postId = Date.now()
      const [postAccount] = createPostPDA(postId, PROGRAM_ID)

      // Prepare fixed-size byte arrays from HEX (Anchor expects raw bytes)
      const titleBytesBuf = Buffer.alloc(32, 0)
      const titleHex = Buffer.from(encryptedTitle, 'hex')
      titleHex.copy(titleBytesBuf, 0, 0, Math.min(32, titleHex.length))

      const contentBytesBuf = Buffer.alloc(128, 0)
      const contentHex = Buffer.from(encryptedContent, 'hex')
      contentHex.copy(contentBytesBuf, 0, 0, Math.min(128, contentHex.length))

      const topicBytesBuf = Buffer.alloc(16, 0)
      const topicHex = Buffer.from(encryptedTopic, 'hex')
      topicHex.copy(topicBytesBuf, 0, 0, Math.min(16, topicHex.length))

      console.log('🔍 Creating post with ID:', postId)
      console.log('📍 Post account:', postAccount.toString())
      console.log('👤 Author:', publicKey.toString())

      // Build instruction
      const ix = new TransactionInstruction({
        keys: [
          { pubkey: postAccount, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: new PublicKey(PROGRAM_ID),
        data: Buffer.concat([
          Buffer.from(DISCRIMINATORS.create_opinion_post),
          u64LE(postId),
          titleBytesBuf,
          contentBytesBuf,
          topicBytesBuf,
        ])
      })

      console.log('📊 Instruction data length:', ix.data.length)
      console.log('📊 Instruction data (hex):', ix.data.toString('hex'))
      console.log('🎯 Program ID:', PROGRAM_ID)

      const tx = new Transaction().add(ix)
      tx.feePayer = publicKey
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
      tx.recentBlockhash = blockhash

      const balance = await connection.getBalance(publicKey, 'confirmed')
      console.log('Wallet balance (lamports):', balance)

      const signature = await sendTransaction(tx, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
      console.log('Transaction confirmed:', signature)

      // Refresh posts to show the new post immediately
      await loadPosts()

      // Add to local state
      const newPost: Post = {
        id: postId,
        encryptedTitle: encryptedTitle,
        encryptedContent: encryptedContent,
        encryptedTopic: encryptedTopic,
        author: publicKey.toString(),
        createdAt: Date.now(),
        totalComments: 0,
        totalFeedback: 0,
        // Since we just created it, we can show the decrypted versions
        title,
        content,
        topic
      }

      setPosts(prev => [newPost, ...prev])
      return signature
    } catch (error: any) {
      console.error('Error creating post:', error)

      // Provide more specific error messages
      if (error.message?.includes('User rejected')) {
        throw new Error('Transaction was cancelled by user')
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient SOL for transaction fees')
      } else if (error.message?.includes('Blockhash not found')) {
        throw new Error('Network error - please try again')
      } else {
        throw new Error(`Failed to create post: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }, [publicKey, connection, sendTransaction])

  // Load posts from blockchain
  const loadPosts = useCallback(async () => {
    if (!connection) return

    try {
      console.log('🔍 Fetching posts from blockchain...')

      // Get all program accounts (simpler approach)
      const accounts = await connection.getProgramAccounts(
        new PublicKey(PROGRAM_ID)
      )

      console.log(`📊 Found ${accounts.length} total program accounts`)

      // Filter accounts that start with our opinion_post discriminator
      const opinionPostDiscriminator = Buffer.from([71, 154, 247, 52, 38, 101, 225, 171]) // Actual discriminator from accounts
      const postAccounts = accounts.filter(account =>
        account.account.data.slice(0, 8).equals(opinionPostDiscriminator)
      )

      console.log(`📝 Found ${postAccounts.length} opinion post accounts`)

      const fetchedPosts: Post[] = postAccounts.map((account, index) => {
        try {
          // Parse the account data according to OpinionPostAccount struct
          const data = account.account.data

          // Skip discriminator (8 bytes) and parse fields
          let offset = 8

          // Read post_id (u64, 8 bytes)
          const postId = data.readBigUInt64LE(offset)
          offset += 8

          // Read encrypted_title ([u8; 32], 32 bytes)
          const encryptedTitle = data.slice(offset, offset + 32).toString('hex')
          offset += 32

          // Read encrypted_content ([u8; 128], 128 bytes)
          const encryptedContent = data.slice(offset, offset + 128).toString('hex')
          offset += 128

          // Read encrypted_topic ([u8; 16], 16 bytes)
          const encryptedTopic = data.slice(offset, offset + 16).toString('hex')
          offset += 16

          // Read author (Pubkey, 32 bytes)
          const author = new PublicKey(data.slice(offset, offset + 32))
          offset += 32

          // Read created_at (i64, 8 bytes)
          const createdAt = Number(data.readBigInt64LE(offset))
          offset += 8

          // Read total_comments (u32, 4 bytes)
          const totalComments = data.readUInt32LE(offset)
          offset += 4

          // Read total_feedback (u32, 4 bytes)
          const totalFeedback = data.readUInt32LE(offset)

          console.log(`Parsed post ${postId}:`, {
            author: author.toString(),
            createdAt: new Date(createdAt * 1000).toISOString(),
            totalComments,
            totalFeedback
          })

          return {
            id: Number(postId),
            encryptedTitle,
            encryptedContent,
            encryptedTopic,
            author: author.toString(),
            createdAt,
            totalComments,
            totalFeedback
          }
        } catch (error) {
          console.error(`Failed to parse post account ${index}:`, error)
          return null
        }
      }).filter((post): post is Post => post !== null)

      console.log(`✅ Successfully loaded ${fetchedPosts.length} posts from blockchain`)
      setPosts(fetchedPosts)

    } catch (error) {
      console.error('Failed to load posts from blockchain:', error)
      // Fallback to demo posts if blockchain fetch fails
      console.log('⚠️ Falling back to demo posts')
      const mockPosts: Post[] = [
        {
          id: 1,
          encryptedTitle: encryptData('Welcome to Arcium Opinion Platform'),
          encryptedContent: encryptData('This is a privacy-preserving platform where your opinions matter!'),
          encryptedTopic: encryptData('introduction'),
          author: 'DemoAuthor1',
          createdAt: Date.now() - 3600000,
          totalComments: 2,
          totalFeedback: 5,
          title: 'Welcome to Arcium Opinion Platform',
          content: 'This is a privacy-preserving platform where your opinions matter!',
          topic: 'introduction'
        }
      ]
      setPosts(mockPosts)
    }
  }, [connection])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return {
    posts,
    createPost,
    loading,
    refreshPosts: loadPosts
  }
}
