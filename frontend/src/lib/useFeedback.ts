'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { useState, useEffect, useCallback } from 'react'
import { PROGRAM_ID, ARCIUM_ID, DISCRIMINATORS, u64LE, u32LE, createFeedbackPDA, FeedbackData } from '@/lib/solana'
import { encryptForMPC, nonceToBytes } from '@/lib/arcium'

export function useFeedback() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [feedbackItems, setFeedbackItems] = useState<FeedbackData[]>([])
  const [loading, setLoading] = useState(false)

  // Submit anonymous feedback via Arcium MPC
  const submitFeedback = useCallback(async (
    feedbackId: number,
    rating: number // 1-5 rating
  ) => {
    if (!publicKey) throw new Error('Wallet not connected')
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5')

    setLoading(true)
    try {
      const [feedbackAccount] = createFeedbackPDA(feedbackId, PROGRAM_ID)
      const arciumPubkey = new PublicKey(ARCIUM_ID)

      console.log('🔐 Encrypting feedback with Arcium MPC...')
      console.log('📊 Feedback ID:', feedbackId)
      console.log('⭐ Rating:', rating)
      console.log('📍 Feedback account:', feedbackAccount.toString())

      // Encrypt the rating using Arcium MPC
      const { ciphertext, pubkey, nonce } = await encryptForMPC(rating, arciumPubkey)
      
      console.log('🔒 Encrypted ciphertext:', Buffer.from(ciphertext).toString('hex').substring(0, 16) + '...')
      console.log('🔑 Nonce:', nonce.toString())

      // Build instruction to submit feedback through Arcium MPC
      // The MPC network will aggregate without revealing individual responses
      const ix = new TransactionInstruction({
        keys: [
          { pubkey: feedbackAccount, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: new PublicKey(PROGRAM_ID),
        data: Buffer.concat([
          Buffer.from(DISCRIMINATORS.submit_feedback),
          u64LE(0), // computation_offset
          u64LE(feedbackId),
          Buffer.from(ciphertext), // 32 bytes encrypted rating
          Buffer.from(pubkey), // 32 bytes Arcium pubkey
          nonceToBytes(nonce), // 16 bytes nonce
        ])
      })

      const tx = new Transaction().add(ix)
      tx.feePayer = publicKey
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
      tx.recentBlockhash = blockhash

      const signature = await sendTransaction(tx, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
      console.log('✅ Feedback submitted via MPC:', signature)

      // Refresh feedback data
      await loadFeedback()

      return signature
    } catch (error: any) {
      console.error('Error submitting feedback:', error)
      
      if (error.message?.includes('User rejected')) {
        throw new Error('Transaction was cancelled by user')
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient SOL for transaction fees')
      } else {
        throw new Error(`Failed to submit feedback: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }, [publicKey, connection, sendTransaction])

  // Initialize a new feedback collection
  const initializeFeedback = useCallback(async (
    feedbackId: number,
    category: string,
    question: string
  ) => {
    if (!publicKey) throw new Error('Wallet not connected')

    setLoading(true)
    try {
      const [feedbackAccount] = createFeedbackPDA(feedbackId, PROGRAM_ID)

      console.log('🎬 Initializing feedback collection...')
      console.log('📊 Feedback ID:', feedbackId)
      console.log('📂 Category:', category)
      console.log('❓ Question:', question)

      // Convert strings to fixed-size buffers
      const categoryBuf = Buffer.alloc(32, 0)
      Buffer.from(category).copy(categoryBuf, 0, 0, Math.min(32, category.length))

      const questionBuf = Buffer.alloc(128, 0)
      Buffer.from(question).copy(questionBuf, 0, 0, Math.min(128, question.length))

      const ix = new TransactionInstruction({
        keys: [
          { pubkey: feedbackAccount, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: new PublicKey(PROGRAM_ID),
        data: Buffer.concat([
          Buffer.from(DISCRIMINATORS.init_feedback_stats),
          u64LE(feedbackId),
          categoryBuf,
          questionBuf,
        ])
      })

      const tx = new Transaction().add(ix)
      tx.feePayer = publicKey
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
      tx.recentBlockhash = blockhash

      const signature = await sendTransaction(tx, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
      console.log('✅ Feedback initialized:', signature)

      await loadFeedback()

      return signature
    } catch (error: any) {
      console.error('Error initializing feedback:', error)
      throw new Error(`Failed to initialize feedback: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [publicKey, connection, sendTransaction])

  // Load all feedback data from blockchain (aggregate results only)
  const loadFeedback = useCallback(async () => {
    if (!connection) return

    try {
      console.log('🔍 Fetching feedback from blockchain...')

      const accounts = await connection.getProgramAccounts(
        new PublicKey(PROGRAM_ID)
      )

      console.log(`📊 Found ${accounts.length} total program accounts`)

      // Filter for feedback stats accounts
      const feedbackDiscriminator = Buffer.from([142, 228, 58, 207, 238, 186, 105, 74])
      const feedbackAccounts = accounts.filter(account =>
        account.account.data.slice(0, 8).equals(feedbackDiscriminator)
      )

      console.log(`📝 Found ${feedbackAccounts.length} feedback accounts`)

      const fetchedFeedback: FeedbackData[] = feedbackAccounts.map((account, index) => {
        try {
          const data = account.account.data
          let offset = 8 // Skip discriminator

          // Parse feedback stats (aggregate data only, individual responses encrypted)
          const feedbackId = Number(data.readBigUInt64LE(offset))
          offset += 8

          const categoryBuf = data.slice(offset, offset + 32)
          const category = categoryBuf.toString('utf8').replace(/\0/g, '')
          offset += 32

          const questionBuf = data.slice(offset, offset + 128)
          const question = questionBuf.toString('utf8').replace(/\0/g, '')
          offset += 128

          const totalResponses = data.readUInt32LE(offset)
          offset += 4

          const averageRating = data.readFloatLE(offset)
          offset += 4

          // Read distribution array [5 x u32]
          const distribution = []
          for (let i = 0; i < 5; i++) {
            distribution.push(data.readUInt32LE(offset))
            offset += 4
          }

          const createdAt = Number(data.readBigInt64LE(offset))

          console.log(`Parsed feedback ${feedbackId}:`, {
            category,
            question,
            totalResponses,
            averageRating,
            distribution
          })

          return {
            id: feedbackId,
            category,
            question,
            totalResponses,
            averageRating,
            distribution,
            createdAt
          }
        } catch (error) {
          console.error(`Failed to parse feedback account ${index}:`, error)
          return null
        }
      }).filter((item): item is FeedbackData => item !== null)

      console.log(`✅ Successfully loaded ${fetchedFeedback.length} feedback items`)
      setFeedbackItems(fetchedFeedback)

    } catch (error) {
      console.error('Failed to load feedback from blockchain:', error)
      setFeedbackItems([])
    }
  }, [connection])

  useEffect(() => {
    loadFeedback()
  }, [loadFeedback])

  return {
    feedbackItems,
    submitFeedback,
    initializeFeedback,
    loading,
    refreshFeedback: loadFeedback
  }
}
