/**
 * Arcium Devnet Address Helpers
 * 
 * Uses the official Arcium SDK to derive correct devnet addresses
 * instead of hardcoding them. This ensures we're always using the
 * addresses that match the global Arcium devnet cluster.
 */

import { PublicKey } from '@solana/web3.js'
import {
  getMXEAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getArciumProgAddress,
  getClusterAccAddress,
  getClockAccAddress,
  getStakingPoolAccAddress,
} from '@arcium-hq/client'

/**
 * Get the MXE account address for the given program
 */
export function getDevnetMXEAddress(programId: PublicKey): PublicKey {
  return getMXEAccAddress(programId)
}

/**
 * Get the mempool account address for the given program
 */
export function getDevnetMempoolAddress(programId: PublicKey): PublicKey {
  return getMempoolAccAddress(programId)
}

/**
 * Get the executing pool account address for the given program
 */
export function getDevnetExecutingPoolAddress(programId: PublicKey): PublicKey {
  return getExecutingPoolAccAddress(programId)
}

/**
 * Get the Arcium program address
 */
export function getDevnetArciumProgramAddress(): PublicKey {
  return getArciumProgAddress()
}

/**
 * Get the cluster address for the global devnet cluster
 * Uses cluster offset 1078779259 which is the global Arcium devnet cluster
 */
export function getDevnetClusterAddress(): PublicKey {
  // Global devnet cluster offset
  const DEVNET_CLUSTER_OFFSET = 1078779259
  return getClusterAccAddress(DEVNET_CLUSTER_OFFSET)
}

/**
 * Get the fee pool address that matches the deployed program's expectation
 * The program's ARCIUM_FEE_POOL_ACCOUNT_ADDRESS in arcium-anchor 0.3.1
 * resolves to: 7MGSS4iKNM4sVib7bDZDJhVqB6EcchPwVnTKenCY1jt3
 */
export function getDevnetFeePoolAddress(): PublicKey {
  // Use the exact address from the program's IDL
  return new PublicKey('7MGSS4iKNM4sVib7bDZDJhVqB6EcchPwVnTKenCY1jt3')
}

/**
 * Get the clock account address using Arcium SDK
 */
export function getDevnetClockAddress(): PublicKey {
  return getClockAccAddress()
}

/**
 * Get all required Arcium devnet addresses for a program
 */
export function getDevnetArciumAddresses(programId: PublicKey) {
  return {
    mxe: getDevnetMXEAddress(programId),
    mempool: getDevnetMempoolAddress(programId),
    executingPool: getDevnetExecutingPoolAddress(programId),
    cluster: getDevnetClusterAddress(), // Global devnet cluster, not program-specific
    feePool: getDevnetFeePoolAddress(),
    clock: getDevnetClockAddress(),
    arciumProgram: getDevnetArciumProgramAddress(),
  }
}
