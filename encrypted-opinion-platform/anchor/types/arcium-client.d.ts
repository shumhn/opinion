declare module '@arcium-hq/client' {
  import { PublicKey, Connection } from '@solana/web3.js';

  export function getMXEAccAddress(programId: PublicKey): PublicKey;
  export function getClusterAccAddress(offset: number): PublicKey;
  export function getMempoolAccAddress(programId: PublicKey): PublicKey;
  export function getExecutingPoolAccAddress(programId: PublicKey): PublicKey;
  export function getCompDefAccAddress(programId: PublicKey, offset: number): PublicKey;
  export function getCompDefAccOffset(name: Buffer): number;
  export function getComputationAccAddress(programId: PublicKey, offset: any): PublicKey;
  export function awaitComputationFinalization(
    connection: Connection,
    compDefAccount: PublicKey,
    timeoutMs: number
  ): Promise<void>;
}
