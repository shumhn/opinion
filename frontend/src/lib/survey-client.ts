/**
 * Employee Survey Client for Arcium MPC
 * 
 * This client handles all interactions with the deployed Solana program
 * for employee survey ratings with MPC aggregation.
 */

import * as anchor from '@coral-xyz/anchor'
import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { encryptRating, generateComputationOffset, nonceToBuffer, offsetToBuffer } from './mpc-encryption'
import { getDevnetArciumAddresses } from './arcium-devnet'
import { PROGRAM_ID as CLIENT_PROGRAM_ID } from './solana'
import idl from '../idl/encrypted_opinion_mpc.json'
import { getComputationAccAddress } from '@arcium-hq/client'
import { createHash, randomBytes } from 'crypto'

// Use single source of truth for Program ID (from solana.ts)
const PROGRAM_PUBKEY = new PublicKey(CLIENT_PROGRAM_ID)

// Get Arcium addresses dynamically using the SDK
// This ensures we always use the correct addresses for devnet
const arciumAddresses = getDevnetArciumAddresses(PROGRAM_PUBKEY)

export const MXE_ADDRESS = arciumAddresses.mxe
export const MEMPOOL_ACCOUNT = arciumAddresses.mempool
export const EXECUTING_POOL_ACCOUNT = arciumAddresses.executingPool
export const CLUSTER_ADDRESS = arciumAddresses.cluster
export const FEE_POOL_ACCOUNT = arciumAddresses.feePool
export const CLOCK_ACCOUNT = arciumAddresses.clock
export const ARCIUM_PROGRAM_ID = arciumAddresses.arciumProgram

/**
 * Employee Survey Client
 */
export class EmployeeSurveyClient {
  program: Program
  provider: AnchorProvider

  constructor(connection: Connection, wallet: any) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed'
    })
    this.program = new Program(idl as any, this.provider)
  }

  /**
   * Derive PDA for opinion stats account
   */
  private deriveOpinionStatsPDA(surveyId: bigint): [PublicKey, number] {
    const surveyIdBuffer = offsetToBuffer(surveyId)

    return PublicKey.findProgramAddressSync(
      [Buffer.from('opinion_stats'), surveyIdBuffer],
      PROGRAM_PUBKEY
    )
  }

  /**
   * Derive PDA for sign account
   * Sign PDA is derived from user's program with "SignerAccount" seed (Arcium pattern)
   */
  private deriveSignPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('SignerAccount')],
      PROGRAM_PUBKEY
    )
  }

  /**
   * Derive computation PDA using Arcium SDK
   */
  private deriveComputationPDA(offset: bigint): PublicKey {
    const offsetBN = new anchor.BN(offset.toString())
    return getComputationAccAddress(PROGRAM_PUBKEY, offsetBN)
  }

  /**
   * Derive computation definition PDA using SHA256-based offset (Arcium documentation)
   */
  private deriveCompDefPDA(name: string): [PublicKey, number] {
    // Compute SHA256-based offset
    const hash = createHash('sha256').update(name).digest()
    const offset = hash.readUInt32LE(0)
    const offsetBuffer = Buffer.alloc(4)
    offsetBuffer.writeUInt32LE(offset, 0)
    
    // Derive from Arcium program with correct seeds
    return PublicKey.findProgramAddressSync(
      [Buffer.from('ComputationDefinitionAccount'), PROGRAM_PUBKEY.toBuffer(), offsetBuffer],
      ARCIUM_PROGRAM_ID
    )
  }

  /**
   * Initialize a new employee survey
   * This creates the encrypted stats account via MPC
   */
  async initializeSurvey(surveyId: bigint): Promise<string> {
    const [statsAccount] = this.deriveOpinionStatsPDA(surveyId)
    const [signPDA] = this.deriveSignPDA()
    // Generate unique random offset for each computation (Arcium requirement)
    const computationOffset = new anchor.BN(randomBytes(8))
    const compPDA = getComputationAccAddress(PROGRAM_PUBKEY, computationOffset)
    const [compDefPDA] = this.deriveCompDefPDA('init_opinion_stats')

    try {
      const tx = await this.program.methods
        .initOpinionStats(
          computationOffset,
          new anchor.BN(surveyId.toString())
        )
        .accounts({
          payer: this.provider.wallet.publicKey,
          signPdaAccount: signPDA,
          mxeAccount: MXE_ADDRESS,
          mempoolAccount: MEMPOOL_ACCOUNT,
          executingPool: EXECUTING_POOL_ACCOUNT,
          computationAccount: compPDA,
          compDefAccount: compDefPDA,
          clusterAccount: CLUSTER_ADDRESS,
          poolAccount: FEE_POOL_ACCOUNT,
          clockAccount: CLOCK_ACCOUNT,
          arciumProgram: ARCIUM_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc()

      console.log('✅ Survey initialized:', tx)
      return tx
    } catch (error) {
      console.error('❌ Failed to initialize survey:', error)
      throw error
    }
  }

  /**
   * Submit an employee rating (1-5) to a survey
   * Rating is encrypted and processed via MPC
   */
  async submitRating(surveyId: bigint, rating: number): Promise<string> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    // Encrypt the rating
    const { ciphertext, pubkey, nonce } = encryptRating(rating)
    
    // Generate unique computation offset
    const computationOffset = generateComputationOffset()

    const [statsAccount] = this.deriveOpinionStatsPDA(surveyId)
    const [signPDA] = this.deriveSignPDA()
    const compPDA = this.deriveComputationPDA(computationOffset)
    const [compDefPDA] = this.deriveCompDefPDA('submit_opinion')

    try {
      const tx = await this.program.methods
        .submitOpinionResponse(
          computationOffset,
          surveyId,
          Array.from(ciphertext),
          Array.from(pubkey),
          nonce
        )
        .accounts({
          payer: this.provider.wallet.publicKey,
          signpdaaccount: signPDA,
          opinionaccount: statsAccount,
          mxeaccount: MXE_ADDRESS,
          mempoolaccount: MEMPOOL_ACCOUNT,
          executingpool: EXECUTING_POOL_ACCOUNT,
          computationaccount: compPDA,
          compdefaccount: compDefPDA,
          clusteraccount: CLUSTER_ADDRESS,
          poolaccount: FEE_POOL_ACCOUNT,
          clockaccount: CLOCK_ACCOUNT,
          arciumprogram: ARCIUM_PROGRAM_ID,
          systemprogram: SystemProgram.programId,
        } as any)
        .rpc()

      console.log('✅ Rating submitted:', tx)
      return tx
    } catch (error) {
      console.error('❌ Failed to submit rating:', error)
      throw error
    }
  }

  /**
   * Reveal aggregated survey results
   * This computes the statistics via MPC and reveals only the aggregates
   */
  async revealResults(surveyId: bigint): Promise<string> {
    const computationOffset = generateComputationOffset()

    const [statsAccount] = this.deriveOpinionStatsPDA(surveyId)
    const [signPDA] = this.deriveSignPDA()
    const compPDA = this.deriveComputationPDA(computationOffset)
    const [compDefPDA] = this.deriveCompDefPDA('reveal_opinion_stats')

    try {
      const tx = await this.program.methods
        .revealOpinionStats(computationOffset, surveyId)
        .accounts({
          payer: this.provider.wallet.publicKey,
          signpdaaccount: signPDA,
          opinionaccount: statsAccount,
          mxeaccount: MXE_ADDRESS,
          mempoolaccount: MEMPOOL_ACCOUNT,
          executingpool: EXECUTING_POOL_ACCOUNT,
          computationaccount: compPDA,
          compdefaccount: compDefPDA,
          clusteraccount: CLUSTER_ADDRESS,
          poolaccount: FEE_POOL_ACCOUNT,
          clockaccount: CLOCK_ACCOUNT,
          arciumprogram: ARCIUM_PROGRAM_ID,
          systemprogram: SystemProgram.programId,
        } as any)
        .rpc()

      console.log('✅ Results revealed:', tx)
      return tx
    } catch (error) {
      console.error('❌ Failed to reveal results:', error)
      throw error
    }
  }

  /**
   * Fetch survey results (after reveal)
   */
  async getSurveyResults(surveyId: bigint): Promise<{
    totalResponses: number
    averageRating: number
    ratingDistribution: number[]
  } | null> {
    const [statsAccount] = this.deriveOpinionStatsPDA(surveyId)

    try {
      // Fetch the account data directly
      const accountInfo = await this.provider.connection.getAccountInfo(statsAccount)
      if (!accountInfo) {
        console.log('Account not found yet')
        return null
      }

      // Parse the account data (simplified - in production, use proper deserialization)
      // For now, return mock data structure
      return {
        totalResponses: 0,
        averageRating: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
      }
    } catch (error) {
      console.error('❌ Failed to fetch results:', error)
      return null
    }
  }
}
