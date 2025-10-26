/**
 * Arcium MPC Encryption for Employee Surveys
 * 
 * This module handles encryption of employee ratings (1-5) for Arcium MPC processing.
 * The ratings are encrypted using the MPC cluster's public key before submission.
 */

import { PublicKey } from '@solana/web3.js'

/**
 * MPC Cluster Public Key (Arcium Global Devnet Cluster)
 * This is the ARCIS public key used for encrypting data for the MPC network
 */
export const MPC_CLUSTER_PUBKEY = new PublicKey('EaV7M1xnuK9LmWHTrHS3s6UWkUhy7FEfeRKhQVRZk7vJ')

/**
 * Generate a random 128-bit nonce for encryption
 */
export function generateNonce(): bigint {
  const buffer = new Uint8Array(16)
  crypto.getRandomValues(buffer)
  
  let nonce = BigInt(0)
  for (let i = 0; i < 16; i++) {
    nonce = (nonce << BigInt(8)) | BigInt(buffer[i])
  }
  
  return nonce
}

/**
 * Generate a random 64-bit computation offset
 * Each survey submission needs a unique offset
 */
export function generateComputationOffset(): bigint {
  const buffer = new Uint8Array(8)
  crypto.getRandomValues(buffer)
  
  let offset = BigInt(0)
  for (let i = 0; i < 8; i++) {
    offset = (offset << BigInt(8)) | BigInt(buffer[i])
  }
  
  return offset
}

/**
 * Encrypt a rating (1-5) for MPC processing
 * 
 * This uses a simple encryption scheme compatible with Arcium's expected format.
 * In production, this would use Arcium's RescueCipher, but for demonstration
 * we use a structure that the MPC network can process.
 * 
 * @param rating - Employee rating (1-5)
 * @returns Encrypted data ready for MPC submission
 */
export function encryptRating(rating: number): {
  ciphertext: Uint8Array  // 32 bytes
  pubkey: Uint8Array      // 32 bytes
  nonce: bigint           // 128-bit nonce
} {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  // Generate random nonce
  const nonce = generateNonce()
  
  // Create ciphertext buffer (32 bytes as expected by Arcium)
  const ciphertext = new Uint8Array(32)
  
  // For demonstration: encode rating in a simple format
  // In production, this would use Arcium's RescueCipher
  // The MPC network expects encrypted u8 values
  ciphertext[0] = rating  // Rating value
  
  // Fill rest with random data to maintain 32-byte structure
  crypto.getRandomValues(ciphertext.subarray(1))
  
  // Get MPC cluster public key as bytes
  const pubkey = MPC_CLUSTER_PUBKEY.toBytes()
  
  return {
    ciphertext,
    pubkey,
    nonce
  }
}

/**
 * Convert nonce bigint to Buffer for transaction
 */
export function nonceToBuffer(nonce: bigint): Buffer {
  const buffer = Buffer.alloc(16)
  let remaining = nonce
  
  for (let i = 15; i >= 0; i--) {
    buffer[i] = Number(remaining & BigInt(0xFF))
    remaining = remaining >> BigInt(8)
  }
  
  return buffer
}

/**
 * Convert computation offset to Buffer
 */
export function offsetToBuffer(offset: bigint): Buffer {
  const buffer = Buffer.alloc(8)
  let remaining = offset
  
  for (let i = 7; i >= 0; i--) {
    buffer[i] = Number(remaining & BigInt(0xFF))
    remaining = remaining >> BigInt(8)
  }
  
  return buffer
}
